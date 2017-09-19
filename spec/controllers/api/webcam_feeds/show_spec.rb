require 'spec_helper'

describe Api::WebcamFeedsController do
  let(:user) { FactoryGirl.create(:user) }
  include Devise::Test::ControllerHelpers

  it 'shows webcam feeds' do
    sign_in user
    expect(user.device.webcam_feeds.length).to be(0)
    WebcamFeed.create! name: "Name!", device: user.device, url: "Url!"
    get :show, format: :json
    expect(response.status).to eq(200)
    expect(user.device.webcam_feeds.reload.first).to be
    expect(json[:url]).to eq("Url!")
    expect(json[:name]).to eq("Name!")
  end
end
