module Devices
  class UnattendedUpgrade < Mutations::Command
    def execute
      all_eligible_devices.map(&:send_upgrade_request)
    end

    def all_eligible_devices
      Release
        .distinct
        .pluck(:channel)
        .compact
        .sort
        .map { |chan| eligible_devices(chan) }
        .reduce(:or)
    end

    def eligible_devices(chan)
      Device
        .includes(:fbos_config)
        .where("last_saw_api > ?", 3.days.ago)
        .where("fbos_configs.update_channel" => chan)
        .where.not(fbos_version: latest_version(chan))
        .where("fbos_configs.os_auto_update" => true)
        .where(ota_hour_utc: [nil, Time.now.utc.hour])
        .order("RANDOM()")
        .limit(200)
    end

    # rory = Device.find(3091)
    # uu = Devices::UnattendedUpgrade.new
    # irb(main):003:0> uu.latest_version("beta")
    # => "12.0.0.pre.rc9"
    # irb(main):004:0> rory.fbos_version
    # => "12.0.0.pre.RC9"

    def latest_version(chan)
      Release
        .maybe_find_latest(channel: chan)
        .version
        .upcase
        .gsub("-", ".pre.")
    end
  end
end
