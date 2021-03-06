import { Controller } from 'stimulus';

import { createRoomService } from 'services'

export default class extends Controller {
  async add() {
    const name = prompt('请输入房间名')
    const status = await createRoomService(name);

    if (status) window.location.reload()
  }

  join(ev: any) {
    const url =ev.target.getAttribute('data-roomurl')
    if (!url) return;

    window.location.href = url
  }
}
