export namespace ImportUser {
  export const method = "POST";
  export const path = "/user/wechat_claim";
  export const requireLogin = false;
  export declare const Request: {
    code: string;
    uname: string;
  };
  export declare const Response: "Success" | "InvalidReq";
}
