# Api::WebcamFeedController is the RESTful endpoint for managing webcam URLs
# and settings. Most notably seen in the "webcam" panel of the frontend app.
module Api
  class WebcamFeedsController < Api::AbstractController
    def create
      raise "Nope."
    end

    def index
      render json: webcams
    end

    def show
      render json: webcam
    end

    def update
      mutate WebcamFeeds::Update.run(params.as_json, feed: webcam)
    end

    def destroy
      raise "Nope."
    end

  private

    def webcam
      webcams.find(params[:id])
    end

    def webcams
      current_device.webcam_feeds
    end
  end
end
