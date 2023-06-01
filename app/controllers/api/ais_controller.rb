module Api
  class AisController < Api::AbstractController
    include ActionController::Live

    EXPIRY = Rails.env.test? ? 0.seconds : 1.day
    THROTTLE_POLICY = ThrottlePolicy.new(name, min: 10, hour: 100, day: 200)

    def create
      inner_prompt = raw_json[:prompt]
      context_key = raw_json[:context_key]
      sequence_id = raw_json[:sequence_id]
      if sequence_id.nil?
        prompt = lua_prompt
      else
        remove_field = context_key == "title" ? "name" : context_key
        prompt = SEQUENCE_PROMPT_PREFIX \
          + " " + sequence_inner_prompts.fetch(context_key) \
          + " " + clean_sequence(sequence_celery_script, remove_field)
      end
      # puts prompt
      puts "AI #{context_key} prompt length: #{prompt.length}" unless Rails.env.test?

      violation = THROTTLE_POLICY.violation_for(current_device.id)

      if violation
        puts "AI #{context_key} error: throttled" unless Rails.env.test?
        render json: { error: "Too many requests. Try again later." }, status: 403
      else
        THROTTLE_POLICY.track(current_device.id)
        response.headers["Content-Type"] = "text/event-stream"
        response.headers["Last-Modified"] = Time.now.httpdate
        result = make_request(prompt, response.stream)
      end
    ensure
      response.stream.close
    end

    private

    SEQUENCE_PROMPT_PREFIX = "Below is a sequence for controlling a FarmBot."

    def sequence_inner_prompts
      {
        "description" => "Write a concise description of the sequence body in " \
          "#{user.language}. Don't mention anything the sequence doesn't " \
          "explicitly perform. Use 75 words or less. Limit prose.",
        "color" => "Choose a color that best represents the primary concern " \
          "of the sequence.\nExamples:\n" \
          "- Red if concerned with removing weeds or error conditions\n" \
          "- Green if concerned with taking care of plants\n" \
          "- Yellow if concerned with lights\n" \
          "- Blue if concerned with watering\n" \
          "- Orange if concerned with warnings\n" \
          "- Purple if concerned with logic, " \
          "data manipulation, or using 3rd party APIs\n" \
          "- Pink if concerned with taking photos, detecting weeds, or " \
          "measuring soil height\n" \
          "- Gray if the sequence is neutral in its action or there is not " \
          "a clear primary concern\n" \
          "Limit prose and only return the color.",
        "title" => "Write a title for the sequence in #{user.language} " \
          "in 25 characters or less. Don't use the words \"FarmBot\", " \
          "\"Sequence\", or \"Script\" in the title. Limit prose.",
      }
    end

    def lua_prompt
      "Below is the documentation for writing Lua scripts that can control " \
      "a FarmBot machine and interact with the FarmBot Web App API. " \
      "\n#{named_resources}\n" \
      "#{raw_json[:prompt]}\n" \
      "Comment the code in #{user.language}. " \
      "Limit prose and only return the commented code.\n#{lua_function_docs}"
    end

    def make_request(prompt, stream)
      url = "https://api.openai.com/v1/chat/completions"
      lua_request = raw_json[:context_key] == "lua"
      payload = {
        "model" => lua_request ? "gpt-4" : "gpt-3.5-turbo",
        "messages" => [{"role" => "user", "content": prompt}],
        "temperature" => (ENV["OPENAI_API_TEMPERATURE"] || 1).to_f,
        "stream" => true,
      }.to_json
      begin
        conn = Faraday.new(
          url: "https://api.openai.com/v1/chat/completions",
          headers: {
            "Content-Type" => "application/json",
            "Authorization" => "Bearer #{ENV["OPENAI_API_KEY"]}",
          },
        )
        full = ""
        response = conn.post("") do |req|
          req.body = payload
          total = 0
          missed = false
          req.options.on_data = Proc.new do |chunk, size|
            total += chunk.bytes.length
            diff = size - total
            if (diff != 0 && !missed) || Rails.env.test?
              current_device.tell("Response stream incomplete.", ["toast"], "warn")
              missed = true
            end
            data_strings = chunk.split("data: ")[1,999]
            for data_str in data_strings
              data = JSON.parse(data_str)
              output = data["choices"][0]
              if output["finish_reason"].nil?
                content = output["delta"].dig("content") || ""
                full += content
                stream.write(content)
              else
                puts "AI #{raw_json[:context_key]} result: #{full.to_json}"
              end
            end
          end
        end
        {}
      rescue *[Faraday::ConnectionFailed, Faraday::TimeoutError] => exception
        return {"error" => {"message" => exception.message}}
      end
    end

    def sequences
      Sequence.where(device: current_device)
    end

    def sequence
      @sequence ||= sequences.find(raw_json[:sequence_id])
    end

    def sequence_celery_script
      @sequence_celery_script ||= Sequences::Show.run!(sequence: sequence)
    end

    def clean_sequence(sequence_cs, remove_field)
      cleaned = sequence_cs.except("created_at", "updated_at", remove_field)
      cleaned.to_json.gsub(/\s+/, " ").slice(0, 10000)
    end

    def user
      @user ||= User.find_by!(device: current_device)
    end

    def named_resources
      {
        peripherals: Peripheral.where(device: current_device)
          .map{ |p| { name: p.label, id: p.id, pin_number: p.pin } },
        sensors: Sensor.where(device: current_device)
          .map{ |s| { name: s.label, id: s.id, pin_number: s.pin } },
        tools: Tool.where(device: current_device)
          .map{ |t| { name: t.name, id: t.id } },
    }.to_json
    end

    PAGE_NAMES = [
      "advanced",
      "api",
      "configuration",
      "coordinates",
      "curves",
      "e-stop-and-unlock",
      "images",
      "jobs",
      "messages",
      "movements",
      "pins",
      "time",
      "tools",
      "uart",
      "variables",
    ]

    REMOVE = [
      "uart",
      "verify_tool",
      "current_",
      "rpc",
      "cs_eval",
      "move_absolute",
      "find_axis_length",
      "set_job_progress",
      "get_job_progress",
      "calibrate_camera",
      "read_status",
      "fbos_version",
      "firmware_version",
      "get_device",
      "get_fbos_config",
      "get_firmware_config",
      "update_device",
      "update_fbos_config",
      "update_firmware_config",
      "auth_token",
      "inspect",
      "coordinate",
      "check_position",
      "go_to_home",
      "set_pin_io_mode",
      "debug",
      "gcode",
      "watch_pin",
      "soft_stop",
      "emergency_",
      "dispense",
      "photo_grid",
      "grid",
      "sort",
      "new_sensor_reading",
      "base64",
      "take_photo_raw",
      "measure_soil_height",
    ]

    def page_url(page_name)
      "https://raw.githubusercontent.com/FarmBot-Docs/farmbot-developers/main/" \
      "v15/lua/functions/#{page_name}.md"
    end

    def get_page_data(page_name)
      url = page_url(page_name)
      begin
        URI.open(url).read
      rescue SocketError => exception
        puts "AI Lua docs fetch error: #{exception.message}" unless Rails.env.test?
      end
    end

    def shorten_docs(docs)
      functions = docs.split("\n# ")
      keep = []
      for function_section in functions
        function_name = function_section.split("\n")[0] || ""
        if REMOVE.any? { |remove| function_name.start_with?(remove) }
          next
        end
        clean = function_section
          .split("\n").map{ |line| line.strip() }.join("\n")
          .split("\n").filter{ |line| !line.start_with?("--") }.join("\n")
          .gsub(/\{%\ninclude callout.html([\s\S]*)content="/, " ")
          .gsub(/\"\n%}/, " ")
          .gsub(/\n\n/, "\n")
          .strip()
        keep.push("# " + clean)
      end
      keep.join("\n")
    end

    def get_docs()
      function_docs = ""
      for page_name in PAGE_NAMES
        page_data = get_page_data(page_name)
        if page_data.nil?
          return ""
        end
        page_content = page_data.split("---").slice(2, page_data.length).join("---")
        function_docs += page_content
      end
      short_docs = shorten_docs(function_docs)
      puts "AI Lua docs fetched: #{short_docs.length} characters" unless Rails.env.test?
      short_docs
    end

    def lua_function_docs
      Rails.cache.fetch("lua_function_docs", expires_in: EXPIRY) do
        get_docs()
      end
    end

  end
end
