source "https://rubygems.org"
ruby "~> 2.5.0"

gem "active_model_serializers"
gem "bunny"
gem "delayed_job_active_record" # TODO: Get off of SQL backed jobs. Use Redis
gem "delayed_job"
gem "devise"
gem "discard"
gem "figaro"
gem "fog-google"
gem "font-awesome-rails"
gem "foreman"
gem "jwt"
gem "mutations"
gem "paperclip"
gem "pg"
gem "polymorphic_constraints"
gem "rack-attack"
gem "rack-cors"
gem "rails_12factor"
gem "rails"
gem "request_store"
gem "rollbar"
gem "scenic"
gem "secure_headers"
gem "skylight"
gem "tzinfo" # For validation of user selected timezone names
gem "valid_url"
gem "webpack-rails"
# Still working out the bugs. - RC 5 Jul 18
gem "rabbitmq_http_api_client"
gem "zero_downtime_migrations"
gem "redis", "~> 4.0"

group :development, :test do
  gem "thin"
  gem "capybara"
  # gem "deep-cover", "~> 0.4", require: false
  gem "codecov", require: false
  gem "simplecov"
  gem "database_cleaner"
  gem "factory_bot_rails"
  gem "faker"
  gem "hashdiff"
  gem "letter_opener"
  gem "lol_dba"
  gem "pry-rails"
  gem "pry"
  gem "rails-erd"
  gem "rspec-rails"
  gem "rspec"
  gem "selenium-webdriver"
  gem "smarf_doc", git: "https://github.com/RickCarlino/smarf_doc.git"
  gem "climate_control"
end

group :production do
  gem "passenger"
end
