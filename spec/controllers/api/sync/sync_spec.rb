require 'spec_helper'

describe Api::SyncsController do
  include Devise::Test::ControllerHelpers
  describe '#index' do

    let(:user) { FactoryGirl.create(:user) }
    it 'downloads a sync object' do
      sign_in user
      device_id = user.device.id
      FactoryGirl.create_list(:sequence, 2, device_id: device_id)
      FactoryGirl.create_list(:image, 2, device_id: device_id)
      farm_event_ids = user.device.sequences.map(&:id).sort

      get :show

      expect(response.status).to eq(200)
      expect(json).to be_a_kind_of(Hash)
      expect(json[:device][:id]).to eq(device_id)
    end
  end
end
