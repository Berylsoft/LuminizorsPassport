import { Review } from "./review";

export namespace Project {
  export interface ProjectInfo {
    id: number;
    name: string;
    joined: boolean;
    ended: boolean;
  }

  export type ProjectDetail =
    | ProjectDetailEntered
    | ProjectDetailPreSubmitted
    | ProjectDetailPreSubmitRejected
    | ProjectDetailPreSubmitPassed
    | ProjectDetailSubmitted
    | ProjectDetailSubmitRejected;
  interface ProjectDetailBased {
    info: {
      name: string;
      require_harmony_group_intention: boolean;
      pre_submit_file_size_max: number;
      pre_submit_file_size_min: number;
      submit_file_size_max: number;
      submit_file_size_min: number;
      end_time: string;
    };
    status: JoinedStatus;
  }
  interface ProjectDetailEntered extends ProjectDetailBased {
    status: "Entered";
    nda_info: null;
    have_attachment: null;
    pre_submit_detail: null;
    submit_detail: null;
  }
  interface ProjectDetailPreSubmitted extends ProjectDetailBased {
    status: "PreSubmitted";
    nda_info: null;
    have_attachment: null;
    pre_submit_detail: null;
    submit_detail: null;
  }
  interface ProjectDetailPreSubmitRejected extends ProjectDetailBased {
    status: "PreSubmitRejected";
    nda_info: null;
    have_attachment: null;
    pre_submit_detail: {
      Rejected: {
        reason: Review.FirstReview.RejectReason;
      };
    };
    submit_detail: null;
  }
  interface ProjectDetailPreSubmitPassed extends ProjectDetailBased {
    status: "PreSubmitPassed";
    nda_info: NDAStatus;
    have_attachment: boolean | null;
    pre_submit_detail: {
      Passed: Review.GroupInfo;
    };
    submit_detail: null;
  }
  interface ProjectDetailSubmitted extends ProjectDetailBased {
    status: "Submitted" | "SubmitPassed";
    nda_info: NDAStatus;
    have_attachment: boolean;
    pre_submit_detail: Review.FirstReview.Result;
    submit_detail: null;
  }
  interface ProjectDetailSubmitRejected extends ProjectDetailBased {
    status: "SubmitRejected";
    nda_info: NDAStatus;
    have_attachment: boolean;
    pre_submit_detail: Review.FirstReview.Result;
    submit_detail: {
      Rejected: {
        reason: Review.FormalSubmit.RejectReason;
        detail?: string;
      };
    };
  }

  export type JoinedStatus =
    | "Entered"
    | "PreSubmitted"
    | "PreSubmitRejected"
    | "PreSubmitPassed"
    | "Submitted"
    | "SubmitRejected"
    | "SubmitPassed";

  export type NDAStatus = "NoNda" | "Agreed" | { Pending: string };
}
