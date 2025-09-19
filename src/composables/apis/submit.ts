export namespace Submit {
  export const method = "POST";
  export const path = "/user/submit";
  export const requireLogin = true;
  export declare const Request: {
    pid: number;
    comment: string;
    include_pre_submit_file: boolean;
  };
  export declare const Response: "Success" | "InvalidComment";
}
