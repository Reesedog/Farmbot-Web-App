require "spec_helper"
require_relative "../../lib/log_service_support"

describe LogService do
  normal_payl  = '{"meta":{"z":0,"y":0,"x":0,"type":"info","major_version":6},' +
  '"message":"HQ FarmBot TEST 123 Pin 13 is 0","created_at":'+
  '1512585641,"channels":[]}'

  legacy_payl  = '{"meta":{"z":0,"y":0,"x":0,"type":"info"},' +
  '"message":"HQ FarmBot TEST 123 Pin 13 is 0","created_at":'+
  '1512585641,"channels":[]}'
  FakeDeliveryInfo   = Struct.new(:routing_key)
  device_id          = FactoryBot.create(:device).id
  fake_delivery_info = FakeDeliveryInfo.new("bot.device_#{device_id}.logs")

  it "creates new messages in the DB when called" do
    Log.destroy_all
    b4 = Log.count
    LogService.process(fake_delivery_info, normal_payl)
    expect(b4).to be < Log.count
  end

  it "ignores legacy logs" do
    Log.destroy_all
    b4 = Log.count
    LogService.process(fake_delivery_info, legacy_payl)
    expect(b4).to eq(Log.count)
  end
end
