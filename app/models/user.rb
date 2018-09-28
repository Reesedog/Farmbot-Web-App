# A human
class User < ApplicationRecord
  class AlreadyVerified < StandardError; end
  ENFORCE_TOS           = ENV.fetch("TOS_URL") { false }
  SKIP_EMAIL_VALIDATION = ENV.fetch("NO_EMAILS") { false }
  validates :email, uniqueness: true

  belongs_to :device, dependent: :destroy

  devise :database_authenticatable
  devise :trackable

  # http://stackoverflow.com/a/5127684/1064917
  before_validation :set_defaults

  def self.try_auth(email, password)
    user = User.where(email: email).first
    (user && user.valid_password?(password)) ? yield(user) : yield(nil)
  end

  def set_defaults
    self.confirmation_token || self.reset_confirmation_token
  end

  def reset_confirmation_token
    self.confirmation_token = SecureRandom.uuid
  end

  def must_consent?
    ENFORCE_TOS && !agreed_to_terms_at
  end

  def require_consent!
    raise Errors::LegalConsent if must_consent?
    self
  end

  def verified?
    SKIP_EMAIL_VALIDATION ? true : !!confirmed_at
  end

  def self.admin_user
    @admin_user ||= self.find_or_create_by(email: "admin@admin.com") do |u|
      u.name                  = "Administrator"
      u.password              = ENV.fetch("ADMIN_PASSWORD")
      u.password_confirmation = ENV.fetch("ADMIN_PASSWORD")
      u.confirmed_at          = Time.now
      u.agreed_to_terms_at    = Time.now
      u.device_id             = Devices::Create.run!(user: u).id
    end
  end

  def update_tracked_fields!(request)
    super(request) unless FbosDetector.is_fbos_ua?(request)
  end
end
