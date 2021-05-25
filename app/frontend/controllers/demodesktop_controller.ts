import { Controller } from 'stimulus';

const W: any = window;

export default class extends Controller {
  static targets = ['recordBtn', 'video', 'playvideo', 'time'];

  private buffer: Blob[] = []; // 保存录制的数据
  private stream: MediaStream | null = null;
  private mediaRecorder: any = null // 客户端录制

  private _getRecordBtnTarget(): HTMLButtonElement { return (this as any).recordBtnTarget }
  private _getVideoTarget(): HTMLVideoElement { return (this as any).videoTarget }
  private _getPlayVideoTarget(): HTMLVideoElement { return (this as any).playvideoTarget }
  private _getTimearget(): HTMLSpanElement { return (this as any).timeTarget }

  connect() {
    if (!navigator.mediaDevices || !(navigator.mediaDevices as any).getDisplayMedia) {
      console.log("getDisplayMedia not supported.");
      return;
    }

    (navigator.mediaDevices as any).getDisplayMedia({ video: { width: 640, height: 480, frameRate: 15 }, audio: false })
      .then(stream => {
        this.stream = stream;
        this._getVideoTarget().srcObject = stream
      }).catch(err => {
        console.log('getUserMedia error:', err);
      })
  }

  record(ev: any) {
    if (ev.target.textContent.trim() === '开始录制') {
      this.startRecord()
      ev.target.textContent = '暂停录制'
    } else {
      this.stopRecord()
      ev.target.textContent = '开始录制'
    }
  }

  play() {
    // 将录制的数据设置到播放器上
    var blob = new Blob(this.buffer, {type: 'video/webm'});
    this._getPlayVideoTarget().src = window.URL.createObjectURL(blob);
    this._getPlayVideoTarget().srcObject = null;
    this._getPlayVideoTarget().controls = true;
    this._getPlayVideoTarget().play();

    // 暂停录制
    this.stopRecord()
  }

  download() {
    var blob = new Blob(this.buffer, {type: 'video/webm'});
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');

    a.href = url;
    a.style.display = 'none';
    a.download = 'test.webm';
    a.click();
    a.remove()
  }

  // 启动录制
  private startRecord() {
    this.buffer = [];
    this._getTimearget().textContent = '0'

    // 设置录制下来的多媒体格式
    const options = { mimeType: 'video/webm;codecs=vp8' }

    // 判断浏览器是否支持录制
    if(!W.MediaRecorder.isTypeSupported(options.mimeType)){
      console.error(`${options.mimeType} is not supported!`);
      return;
    }

    try {
      // 创建录制对象
      this.mediaRecorder = new W.MediaRecorder(this.stream, options);
    } catch (e) {
      console.error('Failed to create MediaRecorder:', e);
      return;
    }

    // 当有音视频数据来了之后触发该事件
    this.mediaRecorder.ondataavailable = (e: any) => {
      if (e && e.data && e.data.size > 0){
        this.buffer.push(e.data);
        this._getTimearget().textContent = `${Number(this._getTimearget().textContent) + 1}`
      }
    };

    // 开始录制
    this.mediaRecorder.start(10);

    this._getRecordBtnTarget().textContent = '暂停录制'
  }

  // 暂停录制
  private stopRecord() {
    if (!this.mediaRecorder) return
    this.mediaRecorder.stop()
    this._getRecordBtnTarget().textContent = '开始录制'
  }

}
