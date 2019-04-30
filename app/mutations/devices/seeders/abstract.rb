module Devices
  module Seeders
    class Abstract
      include Constants
      attr_reader :device

      # Class level configuration.
      # Change these values on child class to tune
      # default sequences.
      SEQUENCES_MOUNT_TOOL = false
      SEQUENCES_PICKUP_SEED = Models::NONE # ODDBALL NON BOOLEAN CONFIG
      SEQUENCES_PLANT_SEED = false
      SEQUENCES_TAKE_PHOTO_OF_PLANT = false
      SEQUENCES_TOOL_ERROR = false
      SEQUENCES_UNMOUNT_TOOL = false
      SEQUENCES_WATER_PLANT = false

      # DO NOT ALPHABETIZE. ORDER MATTERS! - RC
      COMMAND_ORDER = [
        # PLANTS =================================
        :plants,

        # PERIPHERALS ============================
        :peripherals_lighting,
        :peripherals_peripheral_4,
        :peripherals_peripheral_5,
        :peripherals_vacuum,
        :peripherals_water,

        # PIN BINDINGS ===========================
        :pin_bindings_button_1,
        :pin_bindings_button_2,

        # SENSORS ================================
        :sensors_soil_sensor,
        :sensors_tool_verification,

        # SETTINGS ===============================
        :settings_default_map_size_x,
        :settings_default_map_size_y,
        :settings_device_name,
        :settings_enable_encoders,
        :settings_firmware,

        # TOOL SLOTS =============================
        :tool_slots_slot_1,
        :tool_slots_slot_2,
        :tool_slots_slot_3,
        :tool_slots_slot_4,
        :tool_slots_slot_5,
        :tool_slots_slot_6,

        # TOOLS ==================================
        :tools_seed_bin,
        :tools_seed_tray,
        :tools_seed_trough_1,
        :tools_seed_trough_2,
        :tools_seed_trough_3,
        :tools_seeder,
        :tools_soil_sensor,
        :tools_watering_nozzle,
        :tools_weeder,

        # SEQUENCES ==============================
        :sequences_mount_tool,
        :sequences_pick_up_seed,
        :sequences_plant_seed,
        :sequences_take_photo_of_plant,
        :sequences_tool_error,
        :sequences_unmount_tool,
        :sequences_water_plant,
      ]

      def initialize(device)
        @device = device
      end

      def plants
        PLANTS.map { |x| Points::Create.run!(x, device: device) }
      end

      def peripherals_lighting; end
      def peripherals_peripheral_4; end
      def peripherals_peripheral_5; end
      def peripherals_vacuum; end
      def peripherals_water; end
      def pin_bindings_button_1; end
      def pin_bindings_button_2; end
      def sensors_soil_sensor; end
      def sensors_tool_verification; end

      def sequences_mount_tool
        return unless SEQUENCES_MOUNT_TOOL
        raise "TODO"
      end

      def sequences_pick_up_seed
        model = SEQUENCES_PICKUP_SEED
        return if model == Models::NONE
        raise "TODO"
      end

      def sequences_plant_seed
        return unless SEQUENCES_PLANT_SEED
        raise "TODO"
      end

      def sequences_take_photo_of_plant
        return unless SEQUENCES_TAKE_PHOTO_OF_PLANT
        raise "TODO"
      end

      def sequences_tool_error
        return unless SEQUENCES_TOOL_ERROR
        raise "TODO"
      end

      def sequences_unmount_tool
        return unless SEQUENCES_UNMOUNT_TOOL
        raise "TODO"
      end

      def sequences_water_plant
        return unless SEQUENCES_WATER_PLANT
        raise "TODO"
      end

      def settings_default_map_size_x; end
      def settings_default_map_size_y; end
      def settings_device_name; end
      def settings_enable_encoders; end
      def settings_firmware; end
      def tool_slots_slot_1; end
      def tool_slots_slot_2; end
      def tool_slots_slot_3; end
      def tool_slots_slot_4; end
      def tool_slots_slot_5; end
      def tool_slots_slot_6; end
      def tools_seed_bin; end
      def tools_seed_tray; end
      def tools_seed_trough_1; end
      def tools_seed_trough_2; end
      def tools_seed_trough_3; end
      def tools_seeder; end
      def tools_soil_sensor; end
      def tools_watering_nozzle; end
      def tools_weeder; end

      private

      def attach_peripheral(pin, label)
        Peripherals::Create.run!(device: device,
                                 pin: pin,
                                 label: label)
      end

      def attach_sensor(pin, label, mode)
        Peripherals::Create.run!(device: device,
                                 pin: pin,
                                 label: label,
                                 mode: mode)
      end
    end
  end
end
