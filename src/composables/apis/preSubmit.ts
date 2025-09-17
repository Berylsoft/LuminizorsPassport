export namespace PreSubmit {
  export const method = "POST";
  export const path = "/user/pre_submit";
  export const requireLogin = true;
  export declare const Request: {
    pid: number;
    name: string;
    harmony_group_intention?: boolean;
    comment: string;
    file: {
      File: number;
    };
  };
  export declare const Response: "Success" | "InvalidName" | "InvalidComment";
}
export namespace PreSubmitWithSkipPassword {
  export const method = "POST";
  export const path = "/user/pre_submit";
  export const requireLogin = true;
  export declare const Request: {
    pid: number;
    name: string;
    harmony_group_intention?: boolean;
    comment: string;
    skip: string;
  };
  export declare const Response:
    | "Success"
    | "InvalidName"
    | "InvalidComment"
    | "InvalidSkipPassword";
}
