module Api
  # A controller that contains all of the helper methods and shared logic for
  # all API endpoints.
  class AbstractController < ApplicationController
    # This error is thrown when you try to use a non-JSON request body on an
    # endpoint that requires JSON.
    class OnlyJson < Exception; end;
    CONSENT_REQUIRED = \
      "all device users must agree to terms of service."
    NOT_JSON         = "That request was not valid JSON. Consider checking the"\
                        " request body with a JSON validator.."
    FARMBOT_UA_STRING = "FARMBOTOS"
    NO_UA_FOUND   = FARMBOT_UA_STRING + "/0.0.0 (RPI3) RPI3 (MISSING)"
    respond_to :json
    before_action :check_fbos_version
    before_action :set_default_stuff
    before_action :authenticate_user!
    skip_before_action :verify_authenticity_token
    after_action :skip_set_cookies_header

    rescue_from(ActionController::RoutingError) { sorry "Not found", 404 }
    rescue_from(User::AlreadyVerified) { sorry "Already verified.", 409 }

    rescue_from(JWT::VerificationError) { |e| auth_err }

    rescue_from(ActionDispatch::Http::Parameters::ParseError) { sorry NOT_JSON, 422 }

    rescue_from(ActiveRecord::ValueTooLong) do
      sorry "Please use reasonable lengths on string inputs", 422
    end

    rescue_from Errors::Forbidden do |exc|
      sorry "You can't perform that action. #{exc.message}", 403
    end

    rescue_from OnlyJson do |e|
      sorry "This is a JSON API. Please use _valid_ JSON.", 422
    end

    rescue_from Errors::NoBot do |exc|
      sorry "You need to register a device first.", 422
    end

    rescue_from ActiveRecord::RecordNotFound do |exc|
      sorry "Document not found.", 404
    end

    rescue_from ActiveRecord::RecordInvalid do |exc|
      render json: {error: exc.message}, status: 422
    end

    rescue_from Errors::LegalConsent do |exc|
      render json: {error: CONSENT_REQUIRED}, status: 451
    end

    rescue_from ActiveModel::RangeError do |_|
      sorry "One of those numbers was too big/small. " +
            "If you need larger numbers, let us know.", 422
    end

    def default_serializer_options
      {root: false, user: current_user}
    end

private

    def clean_expired_farm_events
      FarmEvents::CleanExpired.run!(device: current_device)
    end

    # Rails 5 params are no longer simple hashes. This was for security reasons.
    # Our API does not do things the "Rails way" (we use Mutations for input
    # sanitation) so we can ignore this and grab the raw input.
    def raw_json
      @raw_json ||= JSON.parse(request.body.read).tap{ |x| symbolize(x) }
    rescue JSON::ParserError
      raise OnlyJson
    end

    # PROBLEM: We want to deep_symbolize_keys! on all JSON inputs, but what if
    # the user POSTs an Array? It will crash because [] does not respond_to
    # deep_symbolize_keys! This is the workaround. I could probably use a
    # refinement.
    def symbolize(x)
      x.is_a?(Array) ? x.map(&:deep_symbolize_keys!) : x.deep_symbolize_keys!
    end

    REQ_ID = "X-Farmbot-Rpc-Id"

    def set_default_stuff
      request.format                 = "json"
      id                             = request.headers[REQ_ID] || SecureRandom.uuid
      response.headers[REQ_ID]       = id
      # # IMPORTANT: We need to hoist X-Farmbot-Rpc-Id to a global so that it is
      # #            accessible for use with auto_sync.
      Transport.current.set_current_request_id(response.headers[REQ_ID])
    end

    # Disable cookies. This is an API!
    def skip_set_cookies_header
      reset_session
    end

    def no_device
      raise Errors::NoBot
    end

    def authenticate_user!
      # All possible information that could be needed for any of the 3 auth
      # strategies.
      context = { jwt:  request.headers["Authorization"],
                  user: current_user }
      # Returns a symbol representing the appropriate auth strategy, or nil if
      # unknown.
      strategy = Auth::DetermineAuthStrategy.run!(context)
      case strategy
      when :jwt
        sign_in(Auth::FromJWT.run!(context).require_consent!)
      when :already_connected
        # Probably provided a cookie.
        # 9 times out of 10, it's a unit test.
        # Our cookie system works, we just don't use it.
        current_user.require_consent!
        return true
      else
        auth_err
      end
      mark_as_seen
    rescue Mutations::ValidationException => e
      errors = e.errors.message.merge(strategy: strategy)
      render json: {error: errors}, status: 401
    end

    def auth_err
      sorry("You failed to authenticate with the API. Ensure that you " \
            " provide a JSON Web Token in the `Authorization:` header." , 401)
    end

    def sorry(msg, status)
      render json: { error: msg }, status: status
    end

    def mutate(outcome, options = {})
      if outcome.success?
        render options.merge(json: outcome.result)
      else
        Rollbar.info("Mutation error",
                     errors: outcome.errors.message_list.join(" "),
                     user: current_user.try(:email) || "No User")
        render options.merge(json: outcome.errors.message, status: 422)
      end
    end

    def bad_version
      render json: {error: "Upgrade to latest FarmBot OS"}, status: 426
    end

    EXPECTED_VER = Gem::Version::new GlobalConfig.dump["MINIMUM_FBOS_VERSION"]

    # Try to extract FarmBot OS version from user agent.
    def fbos_version
      ua = pretty_ua

      # Attempt 1:
      #   The device is using an HTTP client that does not provide a user-agent.
      #   We will assume this is an old FBOS version and set it to 0.0.0
      return CalculateUpgrade::NULL if ua == NO_UA_FOUND

      # Attempt 2:
      #   If the user agent was missing, we would have returned by now.
      #   If the UA includes FARMBOT_UA_STRING at this point, we can be certain
      #   we have a have a non-legacy FBOS client.
      return Gem::Version::new(ua[10, 5]) if ua.include?(FARMBOT_UA_STRING)

      # Attempt 3:
      #   Pass CalculateUpgrade::NOT_FBOS if all other attempts fail.
      return CalculateUpgrade::NOT_FBOS
    end

    # This is how we lock old versions of FBOS out of the API:
    def check_fbos_version
      when_farmbot_os do
        bad_version unless fbos_version >= EXPECTED_VER
      end
    end

    # Format the user agent header in a way that is easier for us to parse.
    def pretty_ua
      # "FARMBOTOS/3.1.0 (RPI3) RPI3 ()"
      # If there is no user-agent present, we assume it is a _very_ old version
      # of FBOS.
      (request.user_agent || NO_UA_FOUND).upcase
    end

    # Conditionally execute a block when the request was made by a FarmBot
    def when_farmbot_os
      yield if pretty_ua.include?(FARMBOT_UA_STRING)
    end

    # Devices have a `last_saw_api` field to assist users with debugging.
    # We update this column every time an FBOS device talks to the API.
    def mark_as_seen(bot = (current_user && current_user.device))
      when_farmbot_os do
        if bot
          v                = fbos_version
          bot.last_saw_api = Time.now
          # Do _not_ set the FBOS version to 0.0.0 if the UA header is missing.
          bot.fbos_version = v.to_s if v != CalculateUpgrade::NULL
          bot.save!
        end
      end
    end
  end
end
