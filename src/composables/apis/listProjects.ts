import type { Project } from "@/types";

export namespace ListProjects {
  export const method = "POST";
  export const path = "/user/list_projects";
  export const requireLogin = true;
  export declare const Request: null;
  export declare const Response: {
    projects: Project.ProjectInfo[];
  };
}
