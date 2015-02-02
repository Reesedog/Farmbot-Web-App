module Api
  class SequencesController < Api::AbstractController
    # TODO add user authorization maybe (privacy)
    def index
      render json: Sequence.where(user: current_user)
    end

    def show
      render json: sequence
    end

    def create
      mutate Sequences::Create.run(params, user: current_user)
    end

    def update
      mutate Sequences::Update.run(params[:sequence],
                                   user: current_user,
                                   sequence: sequence)
    end

    def destroy
      # TODO: If you touch this again, add a mutation.
      if (sequence.user == current_user) && sequence.destroy
        render nothing: true
      else
        raise Errors::Forbidden, "Not your Sequence object."
      end
    end

    private

    def sequence
      @sequence ||= Sequence.find(params[:id])
    end
  end
end
