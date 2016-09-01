require 'mutations/time_filter'

module Auth
  class Create < Mutations::Command
    required do
      string :bot_token
      string :bot_uuid
    end

    def execute
      Device.find_by(uuid: bot_uuid, token: bot_token)
    rescue ActiveRecord::RecordNotFound
      add_error :auth, :*, 'Bad uuid or token'
    end
  end
end
