/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { version } from "./package.json";
import Logo from "@/assets/image/logo.png";
import QRCode from "@/assets/image/feedback.jpg";

export const config: LuminizorsConfig = {
  name: "析光通",
  version,
  appID: process.env.TARO_APP_ID,
  backendServer:
    process.env.LUMINIZORS_BACKEND_SERVER ?? "https://api.luminizors.com",
  logo: Logo,
  notification: {
    templates: process.env.LUMINIZORS_NOTIFICATION_TEMPLATES?.split(",") || [],
  },
  feedback: {
    groupQRCode: QRCode,
    groupID: "1047336844",
  },
};

export interface LuminizorsConfig {
  name: string;
  version: string;
  appID: string;
  backendServer: string;
  logo: any;
  notification: {
    templates: string[];
  };
  feedback: {
    groupQRCode: any;
    groupID: string;
  };
}
