/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import mimes from "mime/types/standard";
import QRCode from "@/assets/image/feedback.png";
import Logo from "@/assets/image/logo.png";
import packageInfo from "./package.json";

const acceptedMimeTypes = [
  "audio/aac",
  "audio/flac",
  "audio/mpeg",
  "audio/m4a",
  "audio/ogg",
  "audio/ogg; codecs=opus",
  "audio/wav",
  "audio/x-m4a",
];

export const config: LuminizorsConfig = {
  name: "析光通",
  version: packageInfo.version,
  appID: process.env.TARO_APP_ID,
  backendServer:
    process.env.LUMINIZORS_BACKEND_SERVER ?? "https://api.luminizors.net",
  feedback: {
    groupQRCode: QRCode,
    groupID: "1047594288",
  },
  logo: Logo,
  NDA: {
    minReadingTime: 5,
  },
  notification: {
    templates: process.env.LUMINIZORS_NOTIFICATION_TEMPLATES?.split(",") || [],
  },
  upload: {
    acceptedExtensions: acceptedMimeTypes.flatMap((m) => mimes[m] ?? []),
    acceptedMimeTypes,
  },
};
