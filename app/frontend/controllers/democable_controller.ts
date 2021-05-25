import { Controller } from 'stimulus';

import cable from 'channels/consumer';

function createLi(text: string): HTMLLIElement {
  const li = document.createElement('li')
  li.innerHTML = text;
  return li;
}

export default class extends Controller {
  static targets = ['list']

  private _getListTarget(): HTMLUListElement { return (this as any).listTarget }
  private channel: any | null = null
  private connected = false

  doConnect() {
    if (this.connected) return

    if (!this.channel) {
      // 建立连接
      this.channel = cable.subscriptions.create('DemoChannel', {
        connected: () => {
          console.log('Demo channel connected')
          this._getListTarget().append(createLi('连接成功'))
        },
        disconnected: () => {
          console.log('Demo channel disconnected')
          this._getListTarget().append(createLi('连接关闭'))
        },
        rejected: () => {
          console.log('Demo channel rejected')
          this._getListTarget().append(createLi('连接被拒绝'))
        },
        received: (data: any) => {
          console.log('Demo channel receive', data)
          this._getListTarget().append(createLi(`接收到了来自服务端的数据:
            <div>
              <code>${JSON.stringify(data)}</code>
            </div>
          `))
        },
      })
    } else {
      // 重新连接
      this.channel.consumer.connect()
    }

    this.connected = true
  }

  send() {
    if (!this.connected || !this.channel) {
      alert('请先建立连接')
      return
    }
    this.channel.send({text: `发送给服务端的消息: ${prompt('输入要发送的消息')}`})
  }

  perform() {
    if (!this.connected || !this.channel) {
      alert('请先建立连接')
      return
    }
    // 调用服务端的 echo 方法
    this.channel.perform('echo')
  }

  disconnect() {
    if (!this.connected || !this.channel) {
      alert('请先建立连接')
      return
    }
    this.channel.consumer.disconnect()
    this.connected = false
  }
}
