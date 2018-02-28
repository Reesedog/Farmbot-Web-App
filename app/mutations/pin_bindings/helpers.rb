module PinBindings
  module Helpers
    def validate_sequence_id
      unless device.sequences.exists?(sequence_id)
        add_error :seuqence_id, :seuqence_id, "Sequence ID is not valid"
      end
    end
  end
end
