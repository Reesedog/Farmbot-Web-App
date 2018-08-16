class LogDeliveryMailer < ApplicationMailer
  WHOAH = "Device %s is sending too many emails!!! (> 20 / hr)"

  def maybe_crash_if_too_many_logs(device)
    query_params   = { sent_at: 1.hours.ago..Time.now, device_id: device.id }
    sent_this_hour = Log.where(query_params).count
    too_many       = sent_this_hour > Log.max_per_hour
    raise Log::RateLimitError, WHOAH % [device.id] if too_many
  end

  def send_a_digest(device, unsent)
    @emails      = device.users.pluck(:email)
    @messages    = unsent
                    .pluck(:created_at, :message)
                    .map{|(t,m)| [t.in_time_zone(device.timezone || "UTC"), m] }
                    .map{|(x,y)| "[#{x}]: #{y}"}
    @device_name = device.name
    mail(to: @emails, subject: "🌱 New message from #{@device_name}!")
    unsent.update_all(sent_at: Time.now)
  end

  def log_digest(device)
    Log.transaction do
      maybe_crash_if_too_many_logs(device)
      unsent         = device.unsent_routine_emails
      send_a_digest(device, unsent) if unsent.any?
    end
  end
end
