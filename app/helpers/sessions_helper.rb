module SessionsHelper
  def logged_in?
    Current.user.present?
  end
end
