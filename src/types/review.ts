export namespace Review {
  export namespace FirstReview {
    export type Result =
      | { Passed: GroupInfo }
      | { Rejected: { reason: RejectReason } };

    export type RejectReason =
      | "DeviceOrEnvironment"
      | "RequirementNotMet"
      | "InvalidName";
  }

  export namespace FormalSubmit {
    export type Result =
      | "Passed"
      | { Rejected: { reason: RejectReason; detail?: string } };

    export type RejectReason =
      | "DeviceOrEnvironment"
      | "RequirementNotMet"
      | "Other";
  }

  export interface GroupInfo {
    lead: boolean;
    choir: boolean;
    choir_harmony: boolean;
    harmony: boolean;
  }
}
