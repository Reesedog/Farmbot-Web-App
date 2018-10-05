# SCENARIO: RabbitMQ's HTTP auth backend plugin uses *files* instead of ENV vars
#           for configuration.
# PROBLEM: 1. This is the only service that requires such configuartion. All
#             other services are configured in one place- the `.env` file.
#          2. When using files, it's easy to forget that the file needs updates.
#             Refreshing the .env file will NOT refresh rabbit configs.
#          3. This adds an additional step to server provisioning procedures.
# SOLUTION: Since Rabbit requires the API to load ahead of itself, we can create
#           the configuration on-the-fly when the API boots up by using custom
#           ENV vars and string templates. Essentially, the API overwrites the
#           contents of rabbitmq.conf every time it boots up, eliminating the
#           need to refresh/create cumbersome config files.
class RmqConfigWriter
  CONFIG_PATH     = "docker_volumes/rabbit"
  CONFIG_FILENAME = "farmbot_rmq_config.conf"
  CONFIG_OUTPUT   = "#{CONFIG_PATH}/#{CONFIG_FILENAME}"
  NO_API_HOST     = "\nYou MUST set API_HOST to a real IP address or " +
                    "domain name (not localhost).\n" +
                    "API_PORT is also mandatory."
  PROTO           = ENV["FORCE_SSL"] ? "https:" : "http:"
  ADMIN_PASSWORD  = ENV["ADMIN_PASSWORD"]
  CFG_DATA        = { admin_password:   ADMIN_PASSWORD,
                      fully_formed_url: PROTO + ($API_URL || "") }
  ENV_WARNING     = "Warning: ENV[\"ADMIN_PASSWORD\"] not set. If you are not "\
                    "using 3rd party MQTT hosting, please set this value and "\
                    "re-build the server image."
  TEMPLATE        = <<~END
    auth_backends.1                 = cache
    auth_cache.cache_ttl            = 600000
    auth_cache.cached_backend       = http
    auth_http.http_method           = post
    auth_http.resource_path         = %{fully_formed_url}/api/rmq/resource
    auth_http.topic_path            = %{fully_formed_url}/api/rmq/topic
    auth_http.user_path             = %{fully_formed_url}/api/rmq/user
    auth_http.vhost_path            = %{fully_formed_url}/api/rmq/vhost
    default_user                    = admin
    default_user_tags.administrator = true
    default_user_tags.management    = true
    default_pass                    = %{admin_password}
    mqtt.allow_anonymous            = false
  END

  def self.do_render
    puts "Writing RMQ Config ================================================="
    raise BAD_PASSWORD if ADMIN_PASSWORD.length < 5
    FileUtils.mkdir_p CONFIG_PATH
    File.open(CONFIG_OUTPUT, "w+") { |f| f.write(TEMPLATE % CFG_DATA) }
  end

  def self.dont_render
    puts ENV_WARNING
  end

  def self.env_ok?
    ADMIN_PASSWORD && ENV.key?("API_HOST") && ENV.key?("API_PORT")
  end

  def self.render
    env_ok? ? do_render : dont_render
  end
end
