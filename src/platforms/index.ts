import Taro from "@tarojs/taro";
import * as weapp from "./weapp";
import * as web from "./web";
import type { Platform } from "./types";

let platform: Platform;

switch (Taro.getEnv()) {
  case Taro.ENV_TYPE.WEB:
    platform = web;
    break;
  case Taro.ENV_TYPE.WEAPP:
    platform = weapp;
    break;
  default:
    throw new Error("Unsupported Taro environment");
}

export { platform };
export * from "./types";
