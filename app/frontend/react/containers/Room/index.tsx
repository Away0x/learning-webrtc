import React, { useEffect, useRef } from 'react';
import { Button } from 'antd'

import cable from 'channels/consumer'
import DrawBoard from 'react/components/Drawboard'
import Chat from 'react/components/Chat'

function Room() {
  const channelRef = useRef<any>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const roomID = Number(window.location.pathname.replace('/rooms/', ''))

  useEffect(() => {
    if (!roomID) return;
    channelRef.current = cable.subscriptions.create({ channel: 'RoomChannel', room: roomID }, {
      connected() {
        console.log('connected')
      },
      disconnected() {
        console.log('disconnected')
      },
      rejected() {
        console.log('rejected')
      },
      received(data: any) {
        console.log('received', data)
      }
    })
  }, [roomID])

  return (
    <div className="h-full w-full flex flex-col">
      {/* nav */}
      <div className="h-10 w-full bg-gray-50"></div>
      <div className="flex flex-row flex-1">
        <div className="flex-1 bg-red-100">
          <DrawBoard />
        </div>
        <div className="w-72 flex flex-col">
          <div className="bg-red-50 h-60">
            <video ref={videoRef} autoPlay playsInline />
          </div>
          <div className="flex-1 bg-red-200">
            <Chat />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Room
