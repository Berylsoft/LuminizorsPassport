import { CommonFile } from "@/utils";

export namespace File {
  export interface PresignedRequest {
    headers: [string, string][];
    method: "POST" | "PUT" | "PATCH";
    uri: string;
  }

  export interface FileInfo {
    id: number;
    name: string;
  }

  export enum UploadStatus {
    Unselected,
    Initialization,
    Uploading,
    Success,
    Error,
  }
  export interface FileUpload {
    status: UploadStatus;
    file?: CommonFile | undefined;
    abort?: AbortController;
    id?: number;
    error?: Error;
  }
}
