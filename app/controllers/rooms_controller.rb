class RoomsController < ApplicationController

  def index
    @rooms = Room.all
  end

  def create
    @room = Room.new room_params

    if @room.save
      render json: {
        success: true
      }
    else
      render json: {
        success: false,
        errors: @room.errors.full_messages.join(',')
      }
    end
  end

  private

  def room_params
    params.require(:room).permit(:name)
  end

end
