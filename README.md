[![Code Climate](https://codeclimate.com/github/FarmBot/farmbot-web-app/badges/gpa.svg)](https://codeclimate.com/github/FarmBot/farmbot-web-app)
[![Test Coverage](https://codeclimate.com/github/FarmBot/farmbot-web-app/badges/coverage.svg)](https://codeclimate.com/github/FarmBot/farmbot-web-app)

# Do I need this?

This repository is intended for *software developers* who wish to modify the [Farmbot Web App](http://my.farmbot.io/). **If you are not a developer**, you are highly encouraged to use [the publicly available web app](http://my.farmbot.io/).

If you are a developer interested in contributing or would like to provision your own server, you are in the right place.

# Farmbot Web API

**[LATEST STABLE VERSION IS HERE](https://github.com/FarmBot/Farmbot-Web-API/releases)** :star: :star: :star:

This Repo is RESTful JSON API for Farmbot. This includes things like storage of user data, plant data, authorization tokens and a variety of other resources.

The key responsibility of the API is *information and permissions management*. This should not be confused with device control, which is done via [MQTT](https://github.com/FarmBot/mqtt-gateway).

# Developer Setup

## Prerequisites

Your machine will need the following:

 0. [Ruby 2.3.2](http://rvm.io/rvm/install)

## Setup
 0. `git clone https://github.com/FarmBot/Farmbot-Web-API farmbot-web-app`
 0. `cd farmbot-web-app`
 0. `bundle install`
 0. Copy `config/database.example.yml` to `config/database.yml`. In GNU/Linux or Mac: `mv config/database.example.yml config/database.yml`.
 0. `rake db:create:all db:migrate db:seed`
 0. (optional) Verify installation with `RAILS_ENV=test rake db:create db:migrate && rspec spec`.
 0. `MQTT_HOST=your_mqtt_server_domain rails s`
 0. (optional) Run `./install_frontend.sh` to install the latest frontend app. You may also run the frontend on a seperate server. See [frontend repository](https://github.com/FarmBot/farmbot-web-frontend) for details.
 0. Open [localhost:3000](http://localhost:3000).
 0. [Raise an issue](https://github.com/FarmBot/farmbot-web-frontend/issues/new?title=Installation%20Failure) if you hit problems with any of these steps.

# Provisioning Your Own with Dokku

Please see `deployment.md`.

# Config Settings (important)

Here are some of the configuration options you must set when provisioning a new server:

 * **Encryption keys**: Encryption keys will be autogenerated if not present. They can be reset using `rake keys:generate`. If `ENV['RSA_KEY']` is set, it will be used in place of the `*.pem` files. Useful for environments like Heroku, where file system access is not allowed.
 * `ENV['DEVISE_SECRET']`: Used for devise. Use `rake secret` to generate a new value.
 * `ENV['MQTT_HOST']`: Host (no port or slashes or anything) of running [MQTT gateway](https://github.com/FarmBot/mqtt-gateway). This is required so that Farmbot can know where to connect when given an authorization token.
 * `ENV['API_HOST']`: Domain of the server. Default is `localhost`.
 * `ENV['API_PORT']`: Port the server is on. Default is `3000`.
 * `ENV['FORCE_SSL']`: Optional, but *highly* recomended if you are going to support HTTPS.
 * `ENV['ACME_SECRET']`: If you're using ACME based SSL verification (like Let's Encrypt), set this to your ACME challenge string.
 * `ENV['SMTP_USERNAME']`: Email server username.
 * `ENV['SMTP_PASSWORD']`: Email server password.
 * `ENV['SMTP_HOST']`: Email server host name (Eg: `smtp.sendgrid.net`).

**We can't fix issues we don't know about.** Please submit an issue if you are having trouble installing on your local machine.

## Running Specs

Please run them before submitting pull requests.

 * `bundle exec rspec spec`

# Generating an API token

You must pass a `token` string into most HTTP requests under the `Authorization: ` request header.

Here's what a response looks like when you request a token:

```json
{
    "token": {
        "unencoded": {
            "sub": "test123@test.com",
            "iat": 1459109728,
            "jti": "922a5a0d-0b3a-4767-9318-1e41ae600352",
            "iss": "http://localhost:3000/",
            "exp": 1459455328,
            "mqtt": "localhost",
            "bot": "aa7bb37f-5ba3-4654-b2e4-58ed5746508c"
        },
        "encoded":
        // THE IMPORTANT PART IS HERE!!:
         "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZXN0MTIzQHRlc3QuY29tIiwiaWF0IjoxNDU5MTA5NzI4LCJqdGkiOiI5MjJhNWEwZC0wYjNhLTQ3NjctOTMxOC0xZTQxYWU2MDAzNTIiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAvIiwiZXhwIjoxNDU5NDU1MzI4LCJtcXR0IjoibG9jYWxob3N0IiwiYm90IjoiYWE3YmIzN2YtNWJhMy00NjU0LWIyZTQtNThlZDU3NDY1MDhjIn0.KpkNGR9YH68AF3iHP48GormqXzspBJrDGm23aMFGyL_eRIN8iKzy4gw733SaJgFjmebJOqZkz3cly9P5ZpCKwlaxAyn9RvfjQgFcUK0mywWAAvKp5lHfOFLhBBGICTW1r4HcZBgY1zTzVBw4BqS4zM7Y0BAAsflYRdl4dDRG_236p9ETCj0MSYxFagfLLLq0W63943jSJtNwv_nzfqi3TTi0xASB14k5vYMzUDXrC-Z2iBdgmwAYUZUVTi2HsfzkIkRcTZGE7l-rF6lvYKIiKpYx23x_d7xGjnQb8hqbDmLDRXZJnSBY3zGY7oEURxncGBMUp4F_Yaf3ftg4Ry7CiA"
    }
}
```

**Important:** The response is provided as JSON for human readability. For your `Authorization` header, you will only be using `data.token.encoded`. In this example, it's the string starting with `eyJ0eXAiOiJ...`

## Via CURL

```
curl -H "Content-Type: application/json" \
     -X POST \
     -d '{"user":{"email":"test123@test.com","password":"password123"}}' \
     https://my.farmbot.io/api/tokens
```

## Via JQuery

Since the API supports [CORS](http://enable-cors.org/), you can generate your token right in the browser.

Here's an example:

```javascript
$.ajax({
    url: "https://my.farmbot.io/api/tokens",
    type: "POST",
    data: JSON.stringify({user: {email: 'admin@admin.com', password: 'password123'}}),
    contentType: "application/json"
})
.then(function(data){
  // You can now use your token:
  var MY_SHINY_TOKEN = data.token.encoded;
});
```


# Want to Help?

[Low Hanging Fruit](https://github.com/FarmBot/Farmbot-Web-API/search?utf8=%E2%9C%93&q=todo)
