module Api
  class AbstractController < ApplicationController
    class OnlyJson < Exception; end;
    respond_to :json
    before_action :set_default_response_format
    before_action :authenticate_user!
    skip_before_action :verify_authenticity_token
    after_action :skip_set_cookies_header
    rescue_from(JWT::VerificationError) { |e| auth_err }

    rescue_from Errors::Forbidden do |exc|
      sorry "You can't perform that action. #{exc.message}", 403
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

private

    # TODO: Come back and fix this. Rails 5 params conflict with
    # the way we do things right now. We used to just use the params
    # object (it was a hash), but now it is a proper object.
    def raw_json
      @raw_json ||= JSON.parse(request.body.read).tap{ |x| symbolize(x) }
    rescue JSON::ParserError
      raise OnlyJson
    end

    # Just a hack to prevent runtime errors when people POST JSON arrays.
    def symbolize(x)
      x.is_a?(Array) ? x.map(&:deep_symbolize_keys!) : x.deep_symbolize_keys!
    end

    def set_default_response_format
      request.format = "json"
    end

    # Disable cookies. This is an API!
    def skip_set_cookies_header
      reset_session
    end

    def current_device
      @current_device ||= (current_user.try(:device) || no_device)
    end

    def no_device
      raise Errors::NoBot
    end

    def authenticate_user!
      # All possible information that could be needed for any of the 3 auth
      # strategies.
      context = { jwt:           request.headers["Authorization"],
                  user:          current_user }
      # Returns a symbol representing the appropriate auth strategy, or nil if
      # unknown.
      strategy = Auth::DetermineAuthStrategy.run!(context)
      case strategy
      when :jwt
        sign_in(Auth::FromJWT.run!(context))
      when :already_connected
        # Probably provided a cookie.
        # 9 times out of 10, it's a unit test.
        # Our cookie system works, we just don't use it.
        return true
      else
        auth_err
      end
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
        render options.merge(json: outcome.errors.message, status: 422)
      end
    end

    def default_serializer_options
      {root: false, user: current_user}
    end
  end
end
