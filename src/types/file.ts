export namespace File {
  export interface PresignedRequest {
    headers: [string, string][];
    method: "POST" | "PUT" | "PATCH";
    uri: string;
  }

  export type UploadStatus =
    | "unselected"
    | "init"
    | "uploading"
    | "success"
    | "error";

  export interface File {
    name: string;
    path: string;
    size: number;
    type: string;
    calcMD5: () => Promise<string>;
    stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
  }
}
