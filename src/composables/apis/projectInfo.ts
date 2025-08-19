import type { Project } from "@/types";
export namespace ProjectInfo {
  export const method = "POST";
  export const path = "/user/project_info";
  export const requireLogin = true;
  export declare const Request: {
    pid: number;
  };
  export declare const Response: Project.ProjectDetail;
}
