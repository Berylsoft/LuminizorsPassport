import { File } from "@/types";

export namespace UploadFileStart {
  export const method = "POST";
  export const path = "/user/upload_file";
  export const requireLogin = true;
  export declare const Request: {
    Start: {
      pid: number;
      name: string;
      size: number;
      md5: string;
      head: string;
    };
  };
  export declare const Response:
    | {
        File: {
          file_id: number;
          presigned_req: File.PresignedRequest;
        };
      }
    | "CountReached"
    | "CapacityReached"
    | "InvalidFileName"
    | "InvalidFileType";
}

export namespace UploadFileList {
  export const method = "POST";
  export const path = "/user/upload_file";
  export const requireLogin = true;
  export declare const Request: "List";
  export declare const Response: {
    List: {
      files: File.FileInfo[];
    };
  };
}

export namespace UploadFileContinue {
  export const method = "POST";
  export const path = "/user/upload_file";
  export const requireLogin = true;
  export declare const Request: {
    Continue: {
      file_id: number;
    };
  };
  export declare const Response: {
    Continue: {
      presigned_req: File.PresignedRequest;
    };
  };
}

export namespace UploadFileFinish {
  export const method = "POST";
  export const path = "/user/upload_file";
  export const requireLogin = true;
  export declare const Request: {
    Finish: {
      file_id: number;
    };
  };
  export declare const Response: "Success" | "UploadNotFinish";
}
