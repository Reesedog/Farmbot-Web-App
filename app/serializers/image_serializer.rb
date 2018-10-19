class ImageSerializer < ApplicationSerializer
  attributes :device_id, :attachment_processed_at, :attachment_url, :meta

  def attachment_url
    url_ = object.attachment.url("x640")
    # Force google cloud users to use HTTPS://
    return ENV["GCS_KEY"].present? ? url_.gsub("http://", "https://") : url_
  end
end
