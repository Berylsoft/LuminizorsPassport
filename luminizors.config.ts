/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import mime from "mime/lite";
import { version } from "./package.json";
import QRCode from "@/assets/image/feedback.png";
import Logo from "@/assets/image/logo.png";

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
  version,
  appID: process.env.TARO_APP_ID,
  backendServer:
    process.env["LUMINIZORS_BACKEND_SERVER"] ?? "https://api.luminizors.com",
  feedback: {
    groupQRCode: QRCode,
    groupID: "1047594288",
  },
  logo: Logo,
  NDA: {
    minReadingTime: 5,
  },
  notification: {
    templates:
      process.env["LUMINIZORS_NOTIFICATION_TEMPLATES"]?.split(",") || [],
  },
  upload: {
    acceptedExtensions: acceptedMimeTypes.flatMap((m) => [
      ...(mime.getAllExtensions(m) ?? []),
    ]),
    acceptedMimeTypes,
  },
};
