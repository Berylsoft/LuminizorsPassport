/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { platform } from "@/platforms";
import { useUserStore } from "@/stores/user";

export class RequestHelper {
  static readonly bypassLoginRetry: unique symbol = Symbol("bypassLoginRetry");
  protected axios: AxiosInstance;

  constructor(config: RequestHelper.Config) {
    this.axios = axios.create({
      baseURL: config.backendServer,
      headers: {
        "Content-Type": "application/json",
      },
      validateStatus: (code) => code < 300 || code >= 400,
    });
    this.axios.interceptors.response.use(undefined, (err) => {
      const message = err instanceof Error ? err.message : "Unknown error";
      void platform.showToast({
        title: `请求失败:\n ${message}`,
        duration: 3000,
      });
      return Promise.reject(
        new RequestHelper.RequestError({ message, status: -1 }),
      );
    });
  }

  protected async handleResponse<T>(
    response: RequestHelper.CommonResponse<T>,
  ): Promise<T> {
    const requestId = response.headers["x-request-id"] as string;
    const bypassLoginRetry = !!response.config[RequestHelper.bypassLoginRetry];

    if (isSuccessResponse(response)) {
      const { data } = response;
      return data["Ok"];
    } else {
      const { status, data, config } = response;
      const url = new URL(config.url ?? "", config.baseURL).href;
      if (status === 401) {
        if (bypassLoginRetry) {
          throw new RequestHelper.RequestError({
            status,
            data,
            message: "Login required",
            requestId,
            url,
          });
        } else {
          const userStore = useUserStore();
          if (userStore.isLoggedIn) {
            userStore.id = "";
            void platform.showToast({
              title: "登录失效, 请重新登录",
            });
          } else {
            void platform.showToast({
              title: "请先登录",
              icon: "error",
            });
          }

          // retry request
          config[RequestHelper.bypassLoginRetry] = true;
          const res = await axios<T, RequestHelper.CommonResponse<T>>(
            response.config,
          );
          return await this.handleResponse(res);
        }
      } else {
        let message: string;
        if (isErrorInfo(data)) message = data.Err.msg;
        else message = data;
        void platform.showToast({
          title: `请求失败: ${message}(${status.toString()})\n${requestId}`,
          duration: 3000,
        });
        throw new RequestHelper.RequestError({
          data,
          message,
          status,
          requestId,
          url,
        });
      }
    }
  }
  static {
    for (const method of ["get", "delete"] as const) {
      defineProperty(RequestHelper.prototype, method, async function <
        T,
        D,
      >(this: RequestHelper, url: string, config: RequestHelper.RequestConfig<D> = {}) {
        const res = await this.axios[method]<
          T,
          RequestHelper.CommonResponse<T>
        >(url, config);
        const data = await this.handleResponse(res);
        return data;
      });
    }
    for (const method of ["post", "patch", "put"] as const) {
      defineProperty(RequestHelper.prototype, method, async function <
        T,
        D,
      >(this: RequestHelper, url: string, data: unknown = null, config: RequestHelper.RequestConfig<D> = {}) {
        const requestData = { data };
        const res = await this.axios[method]<
          T,
          RequestHelper.CommonResponse<T>
        >(url, requestData, config);
        return await this.handleResponse(res);
      });
    }
  }
}

export interface RequestHelper {
  get<T, D>(url: string, config?: RequestHelper.RequestConfig<D>): Promise<T>;
  delete<T, D>(
    url: string,
    config?: RequestHelper.RequestConfig<D>,
  ): Promise<T>;
  post<T, D>(
    url: string,
    data?: D,
    config?: RequestHelper.RequestConfig<D>,
  ): Promise<T>;
  patch<T, D>(
    url: string,
    data?: D,
    config?: RequestHelper.RequestConfig<D>,
  ): Promise<T>;
  put<T, D>(
    url: string,
    data?: D,
    config?: RequestHelper.RequestConfig<D>,
  ): Promise<T>;
}

export namespace RequestHelper {
  export class RequestError extends Error {
    public data: unknown;
    public status: number;
    public requestId?: string;
    public url?: string;
    constructor(
      options: RequestErrorOptions,
      ...params: Parameters<ErrorConstructor>
    ) {
      super(...params);

      this.name = "RequestError";
      this.message = options.message ?? "Request failed";

      this.data = options.data ?? null;
      this.requestId = options.requestId;
      this.status = options.status;
      this.url = options.url;
    }
  }

  export interface RequestErrorOptions {
    message?: string;
    data?: unknown;
    requestId?: string;
    status: number;
    url?: string;
  }

  export interface Config {
    backendServer: string;
  }

  export interface RequestConfig<D = undefined> extends AxiosRequestConfig<D> {
    [RequestHelper.bypassLoginRetry]?: boolean;
  }

  export type CommonResponse<T> = SuccessResponse<T> | ErrorResponse;

  export type SuccessResponse<T> = AxiosResponse<SuccessResponseBody<T>>;
  export type ErrorResponse = AxiosResponse<ErrorResponseBody>;

  export interface SuccessResponseBody<T> {
    Ok: T;
  }
  export type ErrorResponseBody = ErrorInfo | string;

  export interface ErrorInfo {
    Err: {
      code: number;
      msg: string;
    };
  }
}

function defineProperty<T, K extends keyof T>(object: T, key: K, value: T[K]) {
  return Object.defineProperty(object, key, {
    writable: true,
    value,
    enumerable: false,
  });
}

const isSuccessResponse = <T>(
  res: RequestHelper.CommonResponse<T>,
): res is RequestHelper.SuccessResponse<T> => res.status === 200;
const isErrorInfo = (res: unknown): res is RequestHelper.ErrorInfo =>
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  typeof (res as RequestHelper.ErrorInfo)?.Err?.code === "number" &&
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  typeof (res as RequestHelper.ErrorInfo)?.Err?.msg === "string";
