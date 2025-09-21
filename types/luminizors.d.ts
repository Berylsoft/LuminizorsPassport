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
  upload: {
    acceptedExtensions: string[];
    acceptedMimeTypes: string[];
  };
  feedback: {
    groupQRCode: any;
    groupID: string;
  };
}

declare namespace NodeJS {
  interface ProcessEnv {
    LUMINIZORS_BACKEND_SERVER?: string;
    LUMINIZORS_NOTIFICATION_TEMPLATES?: string;
    TARO_APP_ID: string;
  }
}
