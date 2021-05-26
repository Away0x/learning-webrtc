/**
 * 连接步骤
 * 1. A 主播进入房间，采集媒体，得到音视频 stream，创建 RTCPeerConnection，并绑定 stream
 * 2. B 旁听进入房间，创建 RTCPeerConnection，通过信令服务器进行媒体协商
 *    1. B create offer  -> A
 *    2. A create answer -> B
 * 3. 媒体协商完成后进行 Candidate 连通性检测，A <-> B
 * 4. 检测通过后，即可交换数据了
 *
 * 还有的问题
 * 1. 只实现了一对一，且只能主播先进入房间，旁听用户后进入房间，才可正常连接 (如因为刷新页面等原因产生重复连接，也会导致失败)
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import cable from 'channels/consumer'
import DrawBoard, { DrawboardHandlers } from 'react/components/Drawboard'
import Chat, { MessageItem } from 'react/components/Chat'

interface RoomInfo {
  id: number;
  name: string;
  anchor?: {
    id: number;
    name: string;
  }
}

interface UseRTC {
  userID: number;
  channelRef: React.MutableRefObject<any>;
}

const PEER_CONNECTION_CONFIG = {
  'iceServers': [{
    // 自己搭建 https://github.com/coturn/coturn
    'urls': 'stun:stun.l.google.com:19302'
  }]
}
// const PEER_CONNECTION_CONFIG = null

const MEDIA_CONSTRAINTS = {
  video: {
    width: 290,
    height: 240
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
}

const DESK_CONSTRAINTS = {
  video: true,
  audio: false,
}

function trace(text: string) {
  console.log((window.performance.now() / 1000).toFixed(3), text.trim())
}

function useRTC({ channelRef, userID }: UseRTC) {
  const connectedRef = useRef(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)

  // 本地
  const localPeerConnectionRef = useRef<RTCPeerConnection | null>(null)

  // 创建连接对象
  const createLocalPeerConnection = useCallback(() => {
    localPeerConnectionRef.current = new RTCPeerConnection(PEER_CONNECTION_CONFIG)

    // 收集到了 ICE Candidate, 进行 Candidate 连通性检测
    localPeerConnectionRef.current.onicecandidate = (ev) => {
      if (!ev.candidate) return
      if (!channelRef.current) return
      channelRef.current.send({ type: 'candidate', message: ev.candidate, source: userID })
    }

    // Candidate 连通性检测完成后，两端会建立连接，之后会触发该回调
    // 获取到了远端传输的 stream, 连接播放器
    localPeerConnectionRef.current.ontrack = (ev) => {
      console.log('接收到了 remote stream', ev)
      remoteStreamRef.current = ev.streams[0]
      videoRef.current.srcObject = ev.streams[0]
    }
  }, [userID])

  // 获取本地音视频流
  const getLocalStream = useCallback(async (isDesk = false) => {
    let stream: MediaStream

    try {
      if (isDesk) {
        stream = await (navigator.mediaDevices as any).getDisplayMedia(DESK_CONSTRAINTS)
      } else {
        stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS)
      }
    } catch (err) {
      console.error('[getLocalStream]', isDesk, err)
    }

    if (!stream) return
    if (!localPeerConnectionRef.current) return

    // if (localStreamRef.current) {
    //   const senders = localPeerConnectionRef.current.getSenders()
    //   senders.map(s => localPeerConnectionRef.current.removeTrack(s))
    // }

    localStreamRef.current = stream
    videoRef.current.srcObject = stream

    // 绑定音视频数据到 local RTCPeerConnection 对象上
    stream.getTracks().forEach(track => {
      localPeerConnectionRef.current.addTrack(track, stream)
    })
  }, [])

  // 建立连接
  const createOffer = useCallback(() => {
    if (!localPeerConnectionRef.current) return
    console.log('createOffer')
    localPeerConnectionRef.current.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    }).then((description) => {
      // 存储本地会话描述
      localPeerConnectionRef.current.setLocalDescription(description)
        .then(() => trace(`save local description`))
        .catch((err) => trace(`save local description: ${err}.`))
      // 发送本地会话描述
      channelRef.current.send({ type: 'offer', message: description, source: userID })
    })
  }, [userID])

  const startRTC = (isAnchor: boolean) => {
    if (connectedRef.current) return
    console.log('Start RTC')
    createLocalPeerConnection()
    if (isAnchor) {
      getLocalStream()
    } else {
      createOffer()
    }
    connectedRef.current = true
  }
  const startRTCRef = useRef(startRTC)
  startRTCRef.current = startRTC

  useEffect(() => {
    return () => {
      connectedRef.current = false
    }
  }, [])

  return {
    startRTCRef,
    videoRef,
    localPeerConnectionRef,
  }
}

function checkIsAnchor(userID: number, room: RoomInfo): boolean {
  if (room && room.anchor) return room.anchor.id === userID
  return false
}

function Room() {
  const roomID = Number(window.location.pathname.replace('/rooms/', ''))
  const userID = Number(document.querySelector('meta[name="user-id"]').getAttribute('content'));

  const channelRef = useRef<any>(null)
  const drawboard = useRef<DrawboardHandlers | null>(null)
  const hasAnchor = useRef(false)

  const [messages, setMessages] = useState<MessageItem[]>([])
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null)

  const currentUserIsAnchor = useMemo(() => {
    return checkIsAnchor(userID, roomInfo)
  }, [roomInfo])

  const {
    startRTCRef,
    videoRef,
    localPeerConnectionRef,
  } = useRTC({
    channelRef: channelRef,
    userID,
  })

  const handleCharSend = useCallback((text: string) => {
    if (!channelRef.current) return
    channelRef.current.send({type: 'msg', message: text})
  }, []);

  const handleBoardDraw = useCallback((data: any) => {
    channelRef.current.send({type: 'draw', message: data})
  }, []);

  const handleSignalEvent = () => {

  }
  const handleSignalEventRef = useRef(handleSignalEvent)
  handleSignalEventRef.current = handleSignalEvent

  useEffect(() => {
    if (!roomID) return;
    if (channelRef.current) return
    channelRef.current = cable.subscriptions.create({ channel: 'RoomChannel', room: roomID }, {
      connected() {
        setMessages(s => ([...s, {user: {id: -1, name: 'System'}, message: 'RTM 连接成功'}]))
        channelRef.current.perform('get_room_info')
      },
      disconnected() {
        console.log('disconnected')
      },
      rejected() {
        console.log('rejected')
      },
      received(data: any) {
        switch (data.type) {
          case 'join':
          case 'leave':
          case 'msg':
            setMessages(s => ([...s, data]))
            break
          case 'get_room_info':
            setRoomInfo(data.room)
            hasAnchor.current = !!data.room.anchor
            startRTCRef.current(checkIsAnchor(userID, data.room))
            break
          case 'draw':
            if (!drawboard.current) return
            console.log(data)
            drawboard.current.draw(data.message)
            break
          // RTC 信令相关事件
          // 媒体协商
          case 'offer':
            if (data.source === userID) break
            console.log(data)
            const offerDescription = new RTCSessionDescription(data.message)
            localPeerConnectionRef.current.setRemoteDescription(offerDescription)
              .then(() => trace(`[offer] save remote description`))
              .catch((err) => trace(`[offer] save remote description: ${err}.`))

            localPeerConnectionRef.current.createAnswer().then((description) => {
              localPeerConnectionRef.current.setLocalDescription(description)
                .then(() => trace(`[offer] save local description`))
                .catch((err) => trace(`[offer] save local description: ${err}.`))
              channelRef.current.send({ type: 'answer', message: description, source: userID })
            })
            break
          case 'answer':
            if (data.source === userID) break
            console.log(data)
            const answerDescription = new RTCSessionDescription(data.message)
            localPeerConnectionRef.current.setRemoteDescription(answerDescription)
              .then(() => trace(`[answer] save remote description`))
              .catch((err) => trace(`[answer] save remote description: ${err}.`))
            break
          // Candidate 连通性检测
          case 'candidate':
            if (data.source === userID) break
            console.log(data)
            const iceCandidate = new RTCIceCandidate(data.message);
            localPeerConnectionRef.current.addIceCandidate(iceCandidate)
            break
        }
      }
    })
  }, [roomID, userID])

  return (
    <div className="h-full w-full flex flex-col">
      {/* nav */}
      <div className="h-10 w-full bg-gray-50 flex">
        {roomInfo && (
          <ul className="w-3/4 m-auto h-full flex items-center justify-around">
            <li>房间名: {roomInfo.name}</li>
            <li>当前用户 id: {userID}</li>
            <li>主播: {roomInfo.anchor ? `${roomInfo.anchor.name} id: ${roomInfo.anchor.id}` : '主播不在房间'}</li>
            <li>角色: { currentUserIsAnchor ? '主播' : '听众' }</li>
          </ul>
        )}
      </div>
      <div className="flex flex-row flex-1">
        <div className="flex flex-1 relative">
          <DrawBoard ref={drawboard} onDraw={handleBoardDraw} />
        </div>
        <div className="w-72 flex flex-col">
          <div className="h-60">
            <video className="h-full" ref={videoRef} autoPlay playsInline />
          </div>
          <div className="flex-1">
            <Chat messages={messages} onSend={handleCharSend} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Room
