require "open-uri"
# A set of image URLs (thumbs) + Associated meta data.
class Image < ApplicationRecord
  belongs_to :device
  validates :device, presence: true
  serialize :meta

  # http://stackoverflow.com/a/5127684/1064917
  after_initialize :set_defaults

  def set_defaults
    self.meta ||= {}
  end

  PLACEHOLDER = "/placeholder_farmbot.jpg\?text=Processing..."
  PROTO = ENV["FORCE_SSL"] ? "https:" : "http:"
  DEFAULT_URL = "#{PROTO}#{$API_URL}#{PLACEHOLDER}"
  RMAGICK_STYLES = {
    x1280: "1280x1280>",
    x640: "640x640>",
    x320: "320x320>",
    x160: "160x160>",
    x80: "80x80>",
  }
  MAX_IMAGE_SIZE = 7.megabytes
  CONFIG = { default_url: DEFAULT_URL,
            styles: RMAGICK_STYLES,
            size: { in: 0..MAX_IMAGE_SIZE } }
  BUCKET = ENV["GCS_BUCKET"]

  ROOT_PATH = BUCKET ?
    "https://#{BUCKET}.storage.googleapis.com" : "/system"
  IMAGE_URL_TPL =
    ROOT_PATH + "/images/attachments/%{chunks}/%{size}/%{filename}?%{timestamp}"

  CONTENT_TYPES = ["image/jpg", "image/jpeg", "image/png", "image/gif"]
  GCS_ACCESS_KEY_ID = ENV.fetch("GCS_KEY") { puts "Not using Google Cloud" }
  GCS_HOST = "http://#{BUCKET}.storage.googleapis.com"
  GCS_SECRET_ACCESS_KEY = ENV.fetch("GCS_ID") { puts "Not using Google Cloud" }
  # Worst case scenario for 1280x1280 BMP.
  GCS_BUCKET_NAME = ENV["GCS_BUCKET"]
  GCS_BUCKET_URL = "https://#{GCS_BUCKET_NAME}.storage.googleapis.com"

  # ========= DEPRECATED PAPERCLIP STUFF =========
  # has_attached_file :attachment, CONFIG
  # validates_attachment_content_type :attachment,
  #   content_type: CONTENT_TYPES
  # ========= /DEPRECATED PAPERCLIP STUFF ========
  has_one_attached :attachment

  def set_attachment_by_url(url)
    # File
    # URI::HTTPS
    attachment.attach(io: open(url), filename: "image_#{self.id}")
    self.attachment_processed_at = Time.now
    self
  end

  # Scenario:
  #   User clicks "take photo" and "delete" on Image#123 very quickly.
  # Problem:
  #   Now there's a Delayed::Job pointing to (nonexistent) Image#123,
  #   causing runtime errors in the work queue.
  # Solution:
  #   Don't retry failed deletions. Users can always click the "delete"
  #   button again if need be.
  def self.maybe_destroy(id)
    image = find_by(id: id)
    image.destroy! if image
  end

  def attachment_url(size = "x640")
    # Detect legacy attachments by way of
    # superceded PaperClip-related field.
    # If it has an `attachment_file_size`,
    # it was made with paperclip.
    if attachment && attachment.attached?
      return ROOT_PATH +
               Rails.application.routes.url_helpers.rails_blob_path(attachment)
    end

    if attachment_processed_at
      url = IMAGE_URL_TPL % {
        chunks: id.to_s.rjust(9, "0").scan(/.{3}/).join("/"),
        filename: attachment_file_name,
        size: size,
        timestamp: attachment_updated_at.to_i,
      }
      return ENV["GCS_KEY"].present? ? url.gsub("http://", "https://") : url
    end

    return DEFAULT_URL
  end
end
