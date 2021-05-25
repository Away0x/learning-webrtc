import React, { useCallback, useEffect, useRef, useState } from 'react'

import cable from 'channels/consumer'
import DrawBoard, { DrawboardHandlers } from 'react/components/Drawboard'
import Chat, { MessageItem } from 'react/components/Chat'

function Room() {
  const channelRef = useRef<any>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const drawboard = useRef<DrawboardHandlers | null>(null)

  const [messages, setMessages] = useState<MessageItem[]>([])

  const roomID = Number(window.location.pathname.replace('/rooms/', ''))

  const handleCharSend = useCallback((text: string) => {
    if (!channelRef.current) return
    channelRef.current.send({type: 'msg', message: text})
  }, []);

  const handleBoardDraw = useCallback((data: any) => {
    channelRef.current.send({type: 'draw', message: data})
  }, []);

  useEffect(() => {
    if (!roomID) return;
    channelRef.current = cable.subscriptions.create({ channel: 'RoomChannel', room: roomID }, {
      connected() {
        setMessages(s => ([...s, {user: {id: -1, name: 'System'}, message: 'RTM 连接成功'}]))
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
          case 'msg':
            setMessages(s => ([...s, data]))
            break
          case 'draw':
            if (!drawboard.current) return
            console.log(data)
            drawboard.current.draw(data.message)
            break
        }
      }
    })
  }, [roomID])

  return (
    <div className="h-full w-full flex flex-col">
      {/* nav */}
      <div className="h-10 w-full bg-gray-50"></div>
      <div className="flex flex-row flex-1">
        <div className="flex flex-1">
          <DrawBoard ref={drawboard} onDraw={handleBoardDraw} />
        </div>
        <div className="w-72 flex flex-col">
          <div className="bg-red-50 h-60">
            <video ref={videoRef} autoPlay playsInline />
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
