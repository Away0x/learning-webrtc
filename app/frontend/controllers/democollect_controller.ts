import { Controller } from 'stimulus';

const FILTER = {
  none: 'none',
  blur: 'blur(3px)', // 模糊度
  grayscale: 'grayscale(1)', // 灰度（黑白）
  invert: 'invert(1)', // 反转
  sepia: 'sepia(1)', // 深褐色
}

export default class extends Controller {
  static targets = ['list', 'video', 'picture', 'filters'];

  private _getVideoTarget(): HTMLVideoElement { return (this as any).videoTarget }
  private _getListTarget(): HTMLUListElement { return (this as any).listTarget }
  private _getPictureTarget(): HTMLCanvasElement { return (this as any).pictureTarget }
  private _getFiltersTarget(): HTMLSelectElement { return (this as any).filtersTarget }

  connect() {
    // 判断浏览器是否支持这些 API
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log("enumerateDevices() not supported.");
      return;
    }

    // 获取系统的音视频设备 (摄像头，麦克风)
    navigator.mediaDevices.enumerateDevices()
      .then((deviceInfos) => {
        // 得到每一个设备的信息
        deviceInfos.forEach((deviceInfo) => {
          const li = document.createElement('li')
          li.className = "mb-2"
          li.innerHTML = deviceInfo.kind + ": " + deviceInfo.label + " id = " + deviceInfo.deviceId
          this._getListTarget().append(li)
        });
      }).catch((err) => {
        console.log(err.name + ": " + err.message);
      });
  }

  // 采集音视频
  collect() {
    // 会请求访问媒体设备，如是第一次访问，会向用户弹出提示窗口
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        this._getVideoTarget().srcObject = mediaStream; // 获取到音视频数据(存放了采集到的音视频轨)，传递给 video
      }).catch((error) => {
          // 如用户拒绝, 或要访问的媒体设备不可用
          console.log('navigator.getUserMedia error: ', error);
      });
  }

  // 拍照
  picture() {
    if (!this._getVideoTarget().srcObject) {
      alert('请先采集音视频')
      return
    }

    const picture = this._getPictureTarget()
    picture.getContext('2d').drawImage(this._getVideoTarget(), 0, 0, picture.width, picture.height);
    // 添加滤镜
    const filterVal = this._getFiltersTarget().value;
    picture.style['-webkit-filter'] = FILTER[filterVal]
  }

  // 保存图片
  savePicture() {
    const oA = document.createElement("a");
    oA.download = 'photo';
    oA.href = this._getPictureTarget().toDataURL("image/jpeg");
    document.body.appendChild(oA);
    oA.click();
    oA.remove();
  }
}
