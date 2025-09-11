import Taro from "@tarojs/taro";
import { promisify } from "./misc";

let fs: Taro.FileSystemManager;
try {
  fs = Taro.getFileSystemManager();
} catch {
  fs = {} as Taro.FileSystemManager;
}

/**
 * wrapper of Taro filesystem
 */
export namespace TaroFS {
  // promisified APIs
  export const close = promisify(fs["close"]);
  export const fstat = promisify(fs["fstat"]);
  export const getFileInfo = promisify(fs["getFileInfo"]);
  export const open = promisify(fs["open"]);
  export const read = promisify(fs["read"]);
  export const readFile = promisify(fs["readFile"]);
}
