class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true
  after_save    :maybe_broadcast, on: [:create, :update]
  after_destroy :maybe_broadcast

  DONT_BROADCAST = [ "current_sign_in_at",
                     "last_sign_in_at",
                     "sign_in_count",
                     "updated_at",
                     "created_at" ]

  # Determine if the changes to the model are worth broadcasting or not.
  # Reduces network noise.
  def notable_changes?
    !self.saved_changes.except(*self.class::DONT_BROADCAST).empty?
  end

  def broadcast?
    Device.current && (destroyed? || notable_changes?)
  end

  def maybe_broadcast
    self.broadcast! if broadcast?
  end

  def broadcast_payload
    { body: destroyed? ? "null" : self.as_json }.to_json
  end

  def chan_name
    "sync.#{self.class.name}.#{self.id}"
  end

  def broadcast!
    Transport.send(broadcast_payload, Device.current.id, chan_name)
  end
end
