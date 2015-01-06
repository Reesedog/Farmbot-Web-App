class Step
  include Mongoid::Document

  MESSAGE_TYPES = %w(single_command read_status pin_write pin_on pin_off
                     move_abs move_rel)

  embedded_in :sequence

  field :message_type
  field :time_stamp, type: Time
  field :command, type: Hash
end
