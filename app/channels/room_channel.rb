class RoomChannel < ApplicationCable::Channel
  def subscribed
    stream_from currentChannel
    ActionCable.server.broadcast currentChannel, type: 'join', user: user_data
  end

  def unsubscribed
    ActionCable.server.broadcast currentChannel, type: 'leave', user: user_data
  end

  def receive(data)
    # case data['type']
    # when 'join'

    # else
    # end
  end

  private

  def currentChannel
    "room::#{params[:room]}"
  end

  def user_data
    { id: current_user.id, name: current_user.username }
  end
end
