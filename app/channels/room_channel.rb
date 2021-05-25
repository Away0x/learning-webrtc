class RoomChannel < ApplicationCable::Channel
  def subscribed
    stream_from currentChannel
    ActionCable.server.broadcast currentChannel,
      type: 'join',
      user: user_data,
      message: "#{user_data[:name]} 进入了房间"
  end

  def unsubscribed
    ActionCable.server.broadcast currentChannel,
      type: 'leave',
      user: user_data,
      message: "#{user_data[:name]} 离开了房间"
  end

  def receive(data)
    case data['type']
    when 'msg'
      ActionCable.server.broadcast currentChannel,
        type: 'msg',
        user: user_data,
        message: data['message']
    when 'draw'
      ActionCable.server.broadcast currentChannel,
        type: 'draw',
        user: user_data,
        message: data["message"]
    else
    end
  end

  private

  def currentChannel
    "room::#{params[:room]}"
  end

  def user_data
    { id: current_user.id, name: current_user.username }
  end
end
