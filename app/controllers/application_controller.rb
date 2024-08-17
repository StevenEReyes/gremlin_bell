class ApplicationController < ActionController::Base
  before_action :authenticate_user!
  include Pundit::Authorization
  before_action :set_ride_types
  before_action :set_prefectures
  before_action :set_regions

  # Pundit: allow-list approach
  after_action :verify_authorized, except: :index, unless: :skip_pundit?
  after_action :verify_policy_scoped, only: :index, unless: :skip_pundit?

  # Uncomment when you *really understand* Pundit!
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized
  def user_not_authorized
    flash[:alert] = "You are not authorized to perform this action."
    redirect_to(root_path)
  end

  private

  def skip_pundit?
    devise_controller? || params[:controller] =~ /(^(rails_)?admin)/
  end

  def set_ride_types
    @ride_types = Route::RIDE_TYPE
  end

  def set_prefectures
    @prefectures = User::PREFECTURES
  end

  def set_regions
    @regions = User::REGIONS
  end
end
