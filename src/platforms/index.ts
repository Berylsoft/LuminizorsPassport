import type { Platform } from "./types";
import * as weapp from "./weapp";
import * as web from "./web";

let platform: Platform;

switch (process.env.TARO_ENV) {
  case "h5":
    platform = web;
    break;
  case "weapp":
    platform = weapp;
    break;
  default:
    throw new Error("Unsupported Taro environment");
}

export { platform };
export * from "./types";
