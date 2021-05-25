class DemosController < ApplicationController
  def index
    @demos = [
      {name: 'WebRTC 音视频采集', link: demos_collect_path },
      {name: 'WebRTC 音视频录制', link: demos_record_path },
      {name: 'WebRTC 共享桌面', link: demos_desktop_path },
      {name: 'WebSocket', link: demos_cable_path },
    ]
  end

  def collect; end

  def record; end

  def cable; end
end
