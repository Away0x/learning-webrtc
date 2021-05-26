import { Controller } from 'stimulus';

enum Types {
  Camera = 'camera',
  Desktop = 'desktop'
}

export default class extends Controller {
  static targets = ['localVideo', 'remoteVideo', 'startBtn', 'callBtn', 'hangupBtn', 'type']

  private _getLocalVideoTarget(): HTMLVideoElement { return (this as any).localVideoTarget }
  private _getRemoteVideoTarget(): HTMLVideoElement { return (this as any).remoteVideoTarget }

  private _getStartBtnTarget(): HTMLButtonElement { return (this as any).startBtnTarget }
  private _getCallBtnTarget(): HTMLButtonElement { return (this as any).callBtnTarget }
  private _getHangupBtnTarget(): HTMLButtonElement { return (this as any).hangupBtnTarget }

  private _getTypeTarget(): HTMLButtonElement { return (this as any).typeTarget }

  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null

  private localPeerConnection: RTCPeerConnection | null = null
  private remotePeerConnection: RTCPeerConnection | null = null

  connect() {
    this._getCallBtnTarget().disabled = true
    this._getHangupBtnTarget().disabled = true
  }

  changeType() {
    this.hangUp()
    this._getStartBtnTarget().disabled = false
    this._getCallBtnTarget().disabled = true
  }

  // 调用本地媒体，获取到本地音视频流
  start() {
    this._getStartBtnTarget().disabled = true

    const mediaFunc = this._getTypeTarget().value === Types.Camera ? 'getUserMedia' : 'getDisplayMedia'

    navigator.mediaDevices[mediaFunc]({ video: true })
      .then((stream: MediaStream) => {
        this._getLocalVideoTarget().srcObject = stream;
        this.localStream = stream;
        trace('Received local stream.')
        this._getCallBtnTarget().disabled = false;
      }).catch((err: any) => {
        trace(`navigator.getUserMedia error: ${err.toString()}.`);
      })

    trace('Requesting local stream.')
  }

  // 与远端建立连接
  // 为了减少代码的复杂度，这里直接在一个页面中实现了两个端，所以也就不需通过信令服务器交换信息了，只需要直接将一端获取的 offer 设置到另一端就好了
  call() {
    this._getCallBtnTarget().disabled = true
    this._getHangupBtnTarget().disabled = false

    trace('Starting call.')

    const videoTracks = this.localStream.getVideoTracks();
    const audioTracks = this.localStream.getAudioTracks();
    if (videoTracks.length > 0) trace(`Using video device: ${videoTracks[0].label}.`)
    if (audioTracks.length > 0) trace(`Using audio device: ${audioTracks[0].label}.`)

    // 1. create local peer connection
    this.localPeerConnection = new RTCPeerConnection(null)
    this.localPeerConnection.addEventListener('icecandidate', this.handleConnection.bind(this))
    this.localPeerConnection.addEventListener('iceconnectionstatechange', this.handleConnectionChange.bind(this))

    // 2. create remote peer connection
    this.remotePeerConnection = new RTCPeerConnection(null)
    // 收集到了 ICE Candidate, 进行 Candidate 连通性检测
    this.remotePeerConnection.addEventListener('icecandidate', this.handleConnection.bind(this))
    this.remotePeerConnection.addEventListener('iceconnectionstatechange', this.handleConnectionChange.bind(this))
    // Candidate 连通性检测完成后，两端会建立连接，之后会触发该回调，得到 localPeerConnection 发送过来的数据
    this.remotePeerConnection.addEventListener('addstream', this.gotRemoteMediaStream.bind(this))

    // 3. 音视频流添加到 RTCPeerConnection 对象中
    ;(this.localPeerConnection as any).addStream(this.localStream)

    // 4. 进行媒体协商
    // 回调中会得到 localPeerConnection 的本地会话描述，即 Offer 类型的 SDP 消息
    trace('localPeerConnection createOffer start.')
    this.localPeerConnection.createOffer({ offerToReceiveVideo: true })
      .then(this.createdOffer.bind(this))
      .catch((err) => {
        trace(`[localPeerConnection#createOffer] Failed to create session description: ${err.toString()}.`)
      })
  }

  hangUp() {
    this.localPeerConnection.close()
    this.remotePeerConnection.close()
    this.localPeerConnection = null
    this.remotePeerConnection = null
    this._getHangupBtnTarget().disabled = true
    this._getCallBtnTarget().disabled = false
    trace('Ending call.')
  }

  // 每次 handleConnection 函数被调用时，就说明 WebRTC 又收集到了一个新的 Candidate。
  // 在真实的场景中，每当获得一个新的 Candidate 后，就会通过信令服务器交换给对端，
  // 对端再调用 RTCPeerConnection 对象的 addIceCandidate 方法将收到的 Candidate 保存起来，
  // 然后按照 Candidate 的优先级进行连通性检测
  // 如果 Candidate 连通性检测完成，那么端与端之间就建立了物理连接，这时媒体数据就可能通这个物理连接源源不断地传输了
  private handleConnection(event: RTCPeerConnectionIceEvent) {
    const peerConnection = event.target as RTCPeerConnection; // 获取到触发 icecandidate 事件的 RTCPeerConnection 对象
    const iceCandidate = event.candidate; // 获取到具体的 Candidate
    if (!iceCandidate) return

    const newIceCandidate = new RTCIceCandidate(iceCandidate);
    const otherPeer = this.getOtherPeer(peerConnection);

    // 将本地获到的 Candidate 添加到远端的 RTCPeerConnection 对象中
    otherPeer.addIceCandidate(newIceCandidate)
      .then(() => {
        trace(`${this.getPeerName(peerConnection)} addIceCandidate success.`);
      }).catch(err => {
        trace(`${this.getPeerName(peerConnection)} failed to add ICE Candidate:\n`+
          `${err.toString()}.`);
      })
  }

  private handleConnectionChange(ev: Event) {
    const peerConnection = ev.target as RTCPeerConnection
    console.log('ICE state change event: ', ev);
    trace(`${this.getPeerName(peerConnection)} ICE state: ${peerConnection.iceConnectionState}.`)
  }

  private gotRemoteMediaStream(ev: any) {
    const mediaStream = ev.stream as MediaStream
    this._getRemoteVideoTarget().srcObject = mediaStream
    this.remoteStream = mediaStream
    trace('Remote peer connection received remote stream.')
  }

  // 媒体信息交换和协商
  // description: 会话描述，即 Offer 类型的 SDP 消息
  // 1. local 使用 setLocalDescription 设置本地描述，然后将此会话描述发送给 remote，
  //    remote 使用 setRemoteDescription 设置 local 给它的描述作为远端描述
  // 2. remote 调用 RTCPeerConnection 的 createAnswer 方法获得它本地的媒体描述
  //    然后，再调用 setLocalDescription 方法设置本地描述并将该媒体信息描述发给 local
  // 3. local 得到 remote 的应答描述后，就调用 setRemoteDescription 设置远程描述
  // 当 local 调用 setLocalDescription 函数成功后，就开始收到网络信息了，即开始收集 ICE Candidate
  // 当 Candidate 被收集上来后，会触发 pc 的 icecandidate 事件，所以在代码中我们需要编写 icecandidate 事件的处理函数，
  // 即 onicecandidate，以便对收集到的 Candidate 进行处理
  private createdOffer(description: RTCSessionDescriptionInit) {
    trace(`Offer from localPeerConnection:\n${description.sdp}`)

    // 将 offer 保存到本地
    this.localPeerConnection.setLocalDescription(description)
      .then(() => {
        trace(`createdOffer localPeerConnection setLocalDescription complete.`);
      }).catch((err) => {
        trace(`[createdOffer-localPeerConnection#setLocalDescription] Failed to create session description: ${err.toString()}.`)
      })

    // remote 将 offer 保存起来
    this.remotePeerConnection.setRemoteDescription(description)
      .then(() => {
        trace(`createdOffer remotePeerConnection setLocalDescription complete.`);
      }).catch((err) => {
        trace(`[createdOffer-remotePeerConnection#setRemoteDescription] Failed to create session description: ${err.toString()}.`)
      })

    // remote 创建 answer
    this.remotePeerConnection.createAnswer()
      .then((description) => {
        this.remotePeerConnection.setLocalDescription(description)
          .then(() => {
            trace(`createAnswer remotePeerConnection setLocalDescription complete.`)
          }).catch(err => {
            trace(`[createAnswer-remotePeerConnection#setLocalDescription] Failed to create session description: ${err.toString()}.`)
          })

        this.localPeerConnection.setRemoteDescription(description)
          .then(() => {
            trace(`createAnswer localPeerConnection setLocalDescription complete.`)
          }).catch(err => {
            trace(`[createAnswer-localPeerConnection#setRemoteDescription] Failed to create session description: ${err.toString()}.`)
          })
      })
      .catch((err) => {
        trace(`[createdOffer-remotePeerConnection#createAnswer] Failed to create session description: ${err.toString()}.`)
      })
  }

  // Gets the "other" peer connection.
  private getOtherPeer(peerConnection: RTCPeerConnection) {
    return peerConnection === this.localPeerConnection ?
      this.remotePeerConnection : this.localPeerConnection
  }

  // Gets the name of a certain peer connection.
  private getPeerName(peerConnection: RTCPeerConnection) {
    return (peerConnection === this.localPeerConnection) ?
        'localPeerConnection' : 'remotePeerConnection';
  }

}

function trace(text: string) {
  console.log((window.performance.now() / 1000).toFixed(3), text.trim())
}
