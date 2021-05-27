class SessionsController < ApplicationController
  layout 'react'

  skip_before_action :require_login

  def new
    redirect_to root_path if logged_in?
  end

  def create
    user = User.find_by(username: params[:username]&.downcase)

    if user&.authenticate(params[:password])
      session[:user_id] = user.id
      cookies.signed[:user_id] = user.id

      render json: {
        success: true,
        data: { id: user.id, username: user.username }
      }
    else
      render json: {
        success: false,
        errors: user ? '密码错误' : 'record not found'
      }
    end
  end

  def destroy
    return unless logged_in?

    session.delete(:user_id)
    redirect_to new_session_path
  end

end
