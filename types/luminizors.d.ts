/* eslint-disable @typescript-eslint/no-explicit-any */
declare interface LuminizorsConfig {
  name: string;
  version: string;
  appID: string;
  backendServer: string;
  logo: any;
  NDA: {
    minReadingTime: number;
  };
  notification: {
    templates: string[];
  };
  feedback: {
    groupQRCode: any;
    groupID: string;
  };
}
