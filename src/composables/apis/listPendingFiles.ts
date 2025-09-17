import type { File } from "@/types";

export namespace ListPendingFiles {
  export const method = "POST";
  export const path = "/user/list_pending_files";
  export const requireLogin = true;
  export declare const Request: { pid: number };
  export declare const Response: {
    files: File.FileInfo[];
    pre_submit_file?: File.FileInfo;
  };
}
