/* eslint-disable @typescript-eslint/no-require-imports */
import Taro from "@tarojs/taro";
import type { Platform } from "./types";

let platform: Platform;

switch (Taro.getEnv()) {
  case Taro.ENV_TYPE.WEB:
    platform = require("./web") as Platform;
    break;
  case Taro.ENV_TYPE.WEAPP:
    platform = require("./weapp") as Platform;
    break;
  default:
    throw new Error("Unsupported Taro environment");
}

export { platform };
export * from "./types";
