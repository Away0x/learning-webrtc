declare namespace Response {
  /** 处理后的接口通用响应类型 */
  export interface CommonApiResponse<T = any> {
    success: boolean;
    errors: string;
    data: T;
  }

  /** 登录 */
  export interface Login {
    token: string;
    user: any;
  }
}
