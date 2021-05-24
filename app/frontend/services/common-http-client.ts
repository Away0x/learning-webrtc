import { HTTPClient, RequestConfig } from 'tools/http-client';

export interface CommonRequestConfig extends RequestConfig {
  hideGlobalErrorToast?: boolean; // 隐藏全局 error toast
  dontAutoBringToken?: boolean; // 不用自动携带 token
  mock?: boolean; // 是否使用 mock 数据 (会调用对应的 getMockData)
}

export const commonHttpClient = new HTTPClient<CommonRequestConfig, Response.CommonApiResponse>(
  {
    timeout: 1000 * 30,
  },
  // 处理响应
  (_, response) => {
    if (response.data && !response.data.success) {
      const msg = response.data.errors || '请求失败';
      alert(msg);
    }
    return response.data
  },
  // 错误处理
  (_, err) => {
    console.error(err);
    const errMsg = '网络连接异常，请稍后重试';

    alert(errMsg)

    return {
      success: false,
      errors: errMsg,
      data: null,
    };
  },
  // 请求参数处理
  (requestConfig) => {
    return requestConfig;
  },
);
