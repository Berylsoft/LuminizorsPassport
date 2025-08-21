export namespace JoinProjectStart {
  export const method = "POST";
  export const path = "/user/join_project";
  export const requireLogin = true;
  export declare const Request: {
    Start: {
      pid: number;
    };
  };
  export declare const Response: {
    Start: {
      question: string;
    };
  };
}
export namespace JoinProject {
  export const method = "POST";
  export const path = "/user/join_project";
  export const requireLogin = true;
  export declare const Request: {
    Join: {
      pid: number;
      answer: string;
    };
  };
  export declare const Response: "Success" | "WrongAnswer";
}
