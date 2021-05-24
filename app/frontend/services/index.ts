import { commonHttpClient as client } from './common-http-client';

/** 登录 */
export async function loginService(
  username: string,
  password: string,
): Promise<Response.CommonApiResponse<Response.Login>> {
  const result = await client.post({
    url: '/session',
    data: { username, password },
  });

  return result;
}

/** 注册 */
export async function registerService(
  username: string,
  password: string,
  password_confirmation: string,
): Promise<boolean> {
  const result = await client.post({
    json: true,
    url: '/users',
    data: {user: { username, password, password_confirmation }},
  });

  return result.success;
}

/** 创建房间 */
export async function createRoomService(name: string) {
  const result = await client.post({
    json: true,
    url: '/rooms',
    data: { room: { name } },
  });

  return result.success;
}
