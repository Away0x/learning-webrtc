class ApplicationController < ActionController::Base
  include SessionsHelper

  before_action :find_current_user
  before_action :require_login
  skip_before_action :verify_authenticity_token

  private

  def find_current_user
    Current.user = User.find_by(id: session[:user_id])
  end

  def require_login
    redirect_to new_session_path unless logged_in?
  end

end
