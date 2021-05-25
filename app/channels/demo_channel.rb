class DemoChannel < ApplicationCable::Channel
  def subscribed
    stream_from "demo::#{current_user}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def receive(data)
    ActionCable.server.broadcast "demo::#{current_user}",
      client: data,
      server: { text: 'DemoChannel 广播的消息' }
  end

  def echo
    ActionCable.server.broadcast "demo::#{current_user}",
      server: { text: '调用了服务端的 echo 方法' }
  end
end
