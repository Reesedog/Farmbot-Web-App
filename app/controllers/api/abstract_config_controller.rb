module Api
  class AbstractConfigController < Api::AbstractController
    class YouMustChangeThis; end
    KLASS         = YouMustChangeThis
    RELATION_NAME = "you_must_change_this"

    def show
      render json: config_object
    end

    def update
      mutate Configs::Update
        .run(target_klass: config_object, update_attrs: raw_json)
    end

    def destroy
      raise "WIP."
    end

  private

    def config_object
      current_device.send(self.class::RELATION_NAME)
    end
  end
end
