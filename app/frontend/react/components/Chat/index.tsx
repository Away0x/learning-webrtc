import React, { useEffect, useRef, useState } from 'react'
import { List, Input } from 'antd';
import { SendOutlined } from '@ant-design/icons'

import './index.scss'

export interface MessageItem {
  user: {
    id: number;
    name: string;
  };
  message: string;
}

interface ChatProps {
  messages: MessageItem[]
  onSend: (text: string) => void
}

function Chat({
  messages,
  onSend,
}: ChatProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [val, setVal] = useState('')

  const handleSend = () => {
    const v = val.trim()
    if (!v) return;
    onSend(v)
    setVal('')
  }

  useEffect(() => {
    if (!containerRef.current) return
    const list = containerRef.current.querySelector('#chat-list')
    if (!list) return
    list.scrollTop = 10000000
  }, [containerRef.current, messages]);

  return (
    <div ref={containerRef} className="flex-1 h-full overflow-hidden">
      <List
        id="chat-list"
        className="overflow-y-auto"
        style={{maxHeight: 'calc(100vh - 40px - 240px - 70px)'}}
        size="small"
        itemLayout="horizontal"
        split={false}
        dataSource={messages}
        renderItem={message => {
          const msgUid = message.user.id;
          const currentUid = Number(document.querySelector('meta[name="user-id"]').getAttribute('content'))
          const isCurrentUser = msgUid === currentUid;

          return (
            <List.Item className={`${isCurrentUser ? 'active-list-item' : ''}`}>
              <List.Item.Meta title={message.user.name} description={message.message} />
            </List.Item>
          )
        }} />
      <div className="flex px-2 items-center" style={{height: '70px'}}>
        <Input
          value={val}
          onChange={ev => setVal(ev.target.value)}
          onPressEnter={handleSend}
          addonAfter={<SendOutlined onClick={handleSend} />} />
      </div>
    </div>
  )
}

export default React.memo(Chat)
