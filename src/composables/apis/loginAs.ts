export namespace LoginAs {
  export const method = "POST";
  export const path = "/user/login_as";
  export const requireLogin = false;
  export declare const Request: {
    token: string;
  };
  export declare const Response: null;
}
