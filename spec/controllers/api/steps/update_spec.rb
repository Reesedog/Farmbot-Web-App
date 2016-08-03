require 'spec_helper'

describe Api::StepsController do

  include Devise::Test::ControllerHelpers

  describe '#update' do
    let(:sequence) { FactoryGirl.create(:sequence, device: user.device) }
    let(:step) { sequence.steps[0] }
    let(:user) { FactoryGirl.create :user }

    it 'updates a step' do
      sign_in user
      params = { id: step._id.to_s,
                 sequence_id: sequence._id.to_s,
                 step: { message_type: 'read_status' } }
      patch :update, params
      expect(response.status).to eq(200)
      expect(step.reload.message_type).to eq('read_status')
    end
  end
end
