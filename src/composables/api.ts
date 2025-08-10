import * as APIs from "./apis";
import { RequestHelper } from "./apis/helper";
import { useConfig } from "./config";

const config = useConfig();

const helper = new RequestHelper({ backendServer: config.backendServer });

const uncapitalize = <T extends string>(str: T) =>
  (str.charAt(0).toLowerCase() + str.slice(1)) as Uncapitalize<T>;
const toLowerCaseMethod = <T extends UpperCaseMethod>(method: T) =>
  method.toLowerCase() as Lowercase<T>;

const LuminizorsAPIs = {};

for (const [_name, API] of Object.entries(APIs)) {
  const name = uncapitalize(_name);
  const method = API.method as UpperCaseMethod;
  type Request = typeof API.Request;
  type Response = typeof API.Response;
  switch (method) {
    case "GET":
    case "DELETE":
      LuminizorsAPIs[name] = (
        config: RequestHelper.RequestConfig<Request> = {},
      ): Promise<Response> =>
        helper[toLowerCaseMethod(method)]<Response, Request>(API.path, {
          [RequestHelper.bypassLoginRetry]: !API.requireLogin,
          ...config,
        });
      break;
    case "POST":
    case "PUT":
    case "PATCH":
      LuminizorsAPIs[name] = (
        data: Request = null,
        config: RequestHelper.RequestConfig<Request> = {},
      ): Promise<Response> =>
        helper[toLowerCaseMethod(method)]<Response, Request>(API.path, data, {
          [RequestHelper.bypassLoginRetry]: !API.requireLogin,
          ...config,
        });
      break;
  }
}

export const useAPI = () => LuminizorsAPIs as LuminizorsAPIs;

export { RequestHelper };
export * from "./apis";

export type UpperCaseMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type LuminizorsAPI<T extends (typeof APIs)[keyof typeof APIs]> =
  T extends {
    method: "GET" | "DELETE";
  }
    ? (
        config?: RequestHelper.RequestConfig<T["Request"]>,
      ) => Promise<T["Response"]>
    : T["Request"] extends null
      ? (
          data?: T["Request"],
          config?: RequestHelper.RequestConfig<T["Request"]>,
        ) => Promise<T["Response"]>
      : (
          data: T["Request"],
          config?: RequestHelper.RequestConfig<T["Request"]>,
        ) => Promise<T["Response"]>;

export type LuminizorsAPIs = {
  [K in keyof typeof APIs as Uncapitalize<K>]: LuminizorsAPI<(typeof APIs)[K]>;
};
