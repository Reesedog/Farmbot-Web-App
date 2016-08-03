require 'spec_helper'

describe Api::SchedulesController do
  include Devise::Test::ControllerHelpers

  describe '#index' do

    let(:user) { FactoryGirl.create(:user) }

    it 'lists all schedules for a user' do
      sign_in user
      schedules = FactoryGirl
                    .create_list(:schedule, 2, device: user.device)
                    .map(&:_id)
                    .map(&:to_s)
                    .sort
      get :index
      expect(response.status).to eq(200)
      expect(json.length).to eq(2)
      expect(json.map{ |s| s[:_id] }.sort).to eq(schedules)
    end
  end
end
