module Sequences
  class Update < Mutations::Command
    using MongoidRefinements

    required do
      model :user, class: User
      model :sequence, class: Sequence
    end

    optional do
      string :name
      string :color, in: Sequence::COLORS
      array :steps
    end

    def validate
      add_error(:steps, :empty, "Can't be blank") if steps == []
      raise Errors::Forbidden unless sequence.device.users.include?(user)
    end

    def execute
      update_attributes(sequence, inputs.except(:user, :sequence, :id))
    end
  end
end
