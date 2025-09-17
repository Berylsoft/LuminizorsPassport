export namespace DeleteFile {
  export const method = "POST";
  export const path = "/user/delete_file";
  export const requireLogin = true;
  export declare const Request: { file_id: number };
  export declare const Response: null;
}
