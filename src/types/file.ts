import type { UpperCaseMethod } from "@/composables/api";
import type { CommonFile } from "@/platforms";

export namespace File {
  export interface PresignedRequest<T extends UpperCaseMethod> {
    headers: [string, string][];
    method: T;
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

  export type FileList = FileListItem[];

  export interface FileListItem extends FileInfo {
    type?: string | undefined;
    selected?: boolean;
  }
}
