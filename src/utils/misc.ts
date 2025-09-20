import { TaroFS } from "@/utils";
import { useAPI } from "@/composables/api";

const DEFAULT_CHUNK_SIZE = 4096;

/** @todo allow call without `option` */
export const promisify =
  <T, U>(fn: (this: U, option: T) => void, thisArg?: U) =>
  (options: Omit<T, "callback" | "fail" | "success">) =>
    new Promise<CallbackResult<T>>((resolve, reject) => {
      fn.call(thisArg!, {
        ...options,
        success: (res: object) => {
          if (typeof res === "object") Reflect.deleteProperty(res, "errMsg");
          resolve(res as CallbackResult<T>);
        },
        fail: (err: { errMsg: string }) => {
          reject(new Error(err.errMsg));
        },
      } as T);
    });

export type CallbackResult<T> = T extends {
  fail?: (result: { errMsg: string }) => void;
  success?: (res: infer U) => void;
}
  ? U extends TaroGeneral.CallbackResult
    ? Omit<U, "errMsg">
    : U
  : never;
export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const toLowerCase = <T extends string>(method: T) =>
  method.toLowerCase() as Lowercase<T>;

export const uncapitalize = <T extends string>(str: T) =>
  (str.charAt(0).toLowerCase() + str.slice(1)) as Uncapitalize<T>;

export const getErrMsg = (err: unknown) =>
  err instanceof Error ? err.message : (err?.toString() ?? "unknown error");

export const clearArray = (arr: unknown[]) => void arr.splice(0);

export const createReadableStream = (path: string) => {
  let file: string,
    p = 0;
  const readToBuffer = async (options: {
    buffer: ArrayBuffer;
    bytesToRead: number;
    bufferOffset: number;
  }) => {
    try {
      await TaroFS.read({
        fd: file,
        arrayBuffer: options.buffer,
        offset: options.bufferOffset,
        length: options.bytesToRead,
      });
      p += options.bytesToRead;
      return options.bytesToRead;
    } catch (err) {
      // if read beyond the file size, read the remaining bytes
      const { stats } = await TaroFS.fstat({ fd: file });
      if (p + options.bytesToRead > stats.size) {
        const bytesToRead = stats.size - p;
        await TaroFS.read({
          fd: file,
          arrayBuffer: options.buffer,
          offset: options.bufferOffset,
          length: options.bytesToRead,
        });
        p += bytesToRead;
        return bytesToRead;
      } else {
        throw err;
      }
    }
  };
  return new ReadableStream({
    type: "bytes",
    autoAllocateChunkSize: DEFAULT_CHUNK_SIZE,
    async start() {
      file = (await TaroFS.open({ filePath: path, flag: "r" })).fd;
    },
    async pull(controller) {
      if (controller.byobRequest) {
        const buffer = controller.byobRequest.view;
        if (!buffer) return;
        const readedBytes = await readToBuffer({
          buffer: buffer.buffer,
          bufferOffset: buffer.byteOffset,
          bytesToRead: buffer.byteLength,
        });
        controller.byobRequest.respond(readedBytes);
        if (readedBytes < buffer.byteLength) controller.close();
      } else {
        const size = controller.desiredSize;
        if (size === null || size <= 0) return;
        const buffer = new ArrayBuffer(size);
        const readedBytes = await readToBuffer({
          buffer,
          bufferOffset: 0,
          bytesToRead: size,
        });
        controller.enqueue(new Uint8Array(buffer, 0, readedBytes));
        if (readedBytes < size) controller.close();
      }
    },
    async cancel() {
      await TaroFS.close({ fd: file });
    },
  });
};

export const readBytesFromStream = async (
  stream: ReadableStream<Uint8Array>,
  length?: number,
) => {
  if (length === undefined) {
    const reader = stream.getReader();
    try {
      const byteArrays: Uint8Array[] = [];
      let length = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (value) {
          byteArrays.push(value);
          length += value.byteLength;
        }
        if (done) break;
      }
      const buffer = new Uint8Array(length);
      byteArrays.reduce((offset, byteArray) => {
        buffer.set(byteArray, offset);
        return offset + byteArray.byteLength;
      }, 0);
      return buffer;
    } finally {
      reader.releaseLock();
    }
  } else {
    const reader = stream.getReader({ mode: "byob" });
    try {
      const bytes = new Uint8Array(length);
      const { value } = await reader.read(bytes);
      return value ?? new Uint8Array(0);
    } finally {
      reader.releaseLock();
    }
  }
};

const byteToHex = new Array<string>(0xff);
for (let n = 0; n <= 0xff; ++n) {
  byteToHex[n] = n.toString(16).padStart(2, "0");
}
export const uint8ArrayToHex = (bytes: Uint8Array) =>
  Array.prototype.reduce.call<
    Uint8Array,
    [(s: string, byte: number) => string, string],
    string
  >(bytes, (s, byte) => s + byteToHex[byte]!, "");

const byteUnits = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
export const humanizeBytes = (bytes: number, decimal = 2) => {
  let v = bytes;
  for (const unit of byteUnits) {
    if (v < 1e3) return `${v.toFixed(decimal)}${unit}`;
    else v /= 1e3;
  }
  return `${v.toFixed(decimal)}YB`;
};

export const cleanUnusedFiles = async (
  usedFiles: number[],
  projectId: number,
) => {
  const API = useAPI();
  const { files } = await API.listPendingFiles({
    pid: projectId,
  });
  await Promise.all(
    files
      .map((file) => file.id)
      .filter((id) => !usedFiles.includes(id))
      .map(async (id) => await API.deleteFile({ file_id: id })),
  );
};
