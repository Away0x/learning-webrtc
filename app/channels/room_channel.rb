class RoomChannel < ApplicationCable::Channel
  def subscribed
    @current_room = Room.find_by(id: params[:room])

    stream_from current_channel
    stream_from current_user_channel

    # 设置主播
    if !@current_room.anchor
      @current_room.anchor = current_user
      @current_room.save

      ActionCable.server.broadcast current_channel, type: 'get_room_info', room: room_data
    end

    ActionCable.server.broadcast current_channel,
      type: 'join',
      user: user_data,
      room: room_data,
      message: "#{user_data[:name]} 进入了房间"
  end

  def unsubscribed
    # 删除主播
    if @current_room.anchor && @current_room.anchor_id == current_user.id
      @current_room.anchor = nil
      @current_room.save

      ActionCable.server.broadcast current_channel, type: 'get_room_info', room: room_data
    end

    ActionCable.server.broadcast current_channel,
      type: 'leave',
      user: user_data,
      message: "#{user_data[:name]} 离开了房间"
  end

  def receive(data)
    case data['type']
    # 聊天
    when 'msg'
      ActionCable.server.broadcast current_channel,
        type: 'msg',
        user: user_data,
        message: data['message']
    # 同步白板
    when 'draw'
      ActionCable.server.broadcast current_channel, type: 'draw', message: data['message']
    # RTC 信令转发
    when 'offer', 'answer', 'candidate'
      ActionCable.server.broadcast current_channel, data
    else
    end
  end

  def get_room_info
    ActionCable.server.broadcast current_user_channel, type: 'get_room_info', room: room_data
  end

  private

  def current_channel
    "room::#{params[:room]}"
  end

  def current_user_channel
    "room::#{params[:room]}::#{current_user.id}"
  end

  def user_data
    { id: current_user.id, name: current_user.username }
  end

  def room_data
    data = { id: @current_room.id, name: @current_room.name, anchor: nil }
    anchor = @current_room.anchor

    if anchor
      data[:anchor] = { id: anchor.id, name: anchor.username }
    end

    data
  end

end
