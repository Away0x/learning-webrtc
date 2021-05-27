class UsersController < ApplicationController

  skip_before_action :require_login, only: [:create]

  def index
    @users = User.where.not(id: Current.user.id)
  end

  def new
    @user = User.new
  end

  def create
    @user = User.new user_params

    if @user.save
      render json: { success: true }
    else
      render json: {
        success: false,
        errors: @user.errors.full_messages.join(',')
      }
    end
  end

  private

  def user_params
    params.require(:user).permit(:username, :password, :password_confirmation)
  end

end
