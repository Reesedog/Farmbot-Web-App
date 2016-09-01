module Steps
  # Initializes a Step _BUT DOES NOT PERSIST TO THE DATABASE_. This is useful
  # When you are creating a yet-to-be-saved Sequence and need to embed Steps.
  class Initialize < Mutations::Command
    required do
      string :message_type, in: Step::MESSAGE_TYPES
      hash(:command) { model :*, class: Object }
    end

    optional do 
      integer :position
    end

    def execute
      Step.new(inputs).tap {|step| step.position ||= 987 }
    end
  end
end
