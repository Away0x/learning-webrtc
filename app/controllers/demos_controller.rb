class DemosController < ApplicationController
  def index
    @demos = [
      {name: '音视频采集', link: demos_collect_path },
      {name: '音视频录制', link: demos_record_path },
      {name: '共享桌面', link: demos_desktop_path },
    ]
  end

  def collect; end

  def record; end
end
