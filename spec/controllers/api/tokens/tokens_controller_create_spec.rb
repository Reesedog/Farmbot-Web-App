require 'spec_helper'

describe Api::TokensController do

  include Devise::Test::ControllerHelpers

  describe '#create' do
    let(:user) { FactoryGirl.create(:user, password: "password") }
    it 'creates a new token' do
      payload = {user: {email: user.email, password: "password"}}
      post :create, params: payload
      token = json[:token][:unencoded]
      expect(token[:iss].last).not_to eq("/") # Trailing slashes are BAD!
      expect(token[:iss]).to include($API_URL)
    end

    it 'handles bad params' do
      err_msg = Api::TokensController::NO_USER_ATTR
      payload = {user: "NOPE!"}
      post :create, params: payload
      expect(json[:error]).to include(err_msg)
    end

    it 'does not bump last_seen if it is not a bot' do
      payload = {user: {email: user.email, password: "password"}}
      before  = user.device.last_seen
      post :create, params: payload
      after   = user.device.reload.last_seen
      expect(before).to eq(after)
    end

    it 'bumps last_seen when it is a bot' do
      ua = "FARMBOTOS/99.99.99 (RPI3) RPI3 (1.1.1)"
      allow(request).to receive(:user_agent).and_return(ua)
      request.env["HTTP_USER_AGENT"] = ua
      payload = {user: {email: user.email, password: "password"}}
      before  = user.device.last_seen || Time.now
      post :create, params: payload
      after = user.device.reload.last_seen
      expect(after).to be
      expect(after).to be > before
    end
  end
end
