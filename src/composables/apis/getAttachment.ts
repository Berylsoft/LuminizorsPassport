import { File } from "@/types";

export namespace GetAttachment {
  export const method = "POST";
  export const path = "/user/get_attachment";
  export const requireLogin = true;
  export declare const Request: { pid: number };
  export declare const Response: {
    presigned_req: File.PresignedRequest<"GET">;
  };
}
