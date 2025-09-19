export namespace PreSubmit {
  export const method = "POST";
  export const path = "/user/pre_submit";
  export const requireLogin = true;
  export declare const Request: {
    pid: number;
    name: string;
    comment: string;
    harmony_group_intention?: boolean;
    skip?: string;
  };
  export declare const Response:
    | "Success"
    | "InvalidName"
    | "InvalidComment"
    | "InvalidSkipPassword";
}
