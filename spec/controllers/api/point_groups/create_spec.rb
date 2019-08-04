require "spec_helper"

describe Api::PointGroupsController do
  include Devise::Test::ControllerHelpers
  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }

  it "creates a point group"
end
