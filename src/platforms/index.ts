import type { Platform } from "./types";

let platform: Platform;

if (process.env.TARO_ENV === "h5") {
  platform = require("./web") as Platform;
} else if (process.env.TARO_ENV === "weapp") {
  platform = require("./weapp") as Platform;
} else {
  throw new Error("Unsupported Taro environment");
}

export { platform };
export * from "./types";
