# A singleton that runs on a seperate process than the web server.
# Listens to *ALL* incoming logs and stores them to the DB.
# Also handles throttling.
class LogService
  THROTTLE_POLICY  = ThrottlePolicy.new(Throttler.new(1.minute) => 1_000,
                                        Throttler.new(1.hour)   => 10_000,
                                        Throttler.new(1.day)    => 100_000)

  def self.process(delivery_info, payload)
    params = { routing_key: delivery_info.routing_key, payload: payload }
    data   = AmqpLogParser.run!(params)
    puts data.payload["message"] if Rails.env.production?
    THROTTLE_POLICY.track(data.device_id)
    maybe_deliver(data)
  end

  def self.maybe_deliver(data)
    throttled = THROTTLE_POLICY.is_throttled(data.device_id)
    ok        = data.valid? && !throttled

    ok ? deliver(data) : warn_user(data)
  end

  def self.deliver(data)
    dev, log = [data.device, data.payload]
    LogDispatch.deliver(dev, Logs::Create.run!(log, device: dev))
  end

  def self.warn_user(data)
    raise "Stopped here."
    binding.pry
  end
end
