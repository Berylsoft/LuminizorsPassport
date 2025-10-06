import type { FileTypeResult } from "file-type";
import type { File as TaroFSFile } from "./weapp";
import type { File as WebFile } from "./web";

export interface CommonAPI {
  name: Lowercase<TaroGeneral.ENV_TYPE>;
  showToast(options: {
    title: string;
    icon?: "success" | "error" | "loading";
    duration?: number;
  }): Promise<void>;
  setTitle(title: string): Promise<void>;
  setClipboard(text: string): Promise<void>;
  getSystemTheme(): "light" | "dark";
  onSystemThemeChange(callback: (theme: "light" | "dark") => void): void;
  getPrivacySetting(): Promise<GetPrivacySettingResult>;
  openPrivacyContract(): Promise<void>;
  requirePrivacyAuthorize(): Promise<boolean>;
  openSetting(config?: {
    withSubscriptions?: boolean;
  }): Promise<OpenSettingResult>;
  getNoticificationSubscribeStatus(template: string): Promise<SubscribeStatus>;
  subscribeNotification(
    templates: string[],
  ): Promise<SubscribeNotificationResult>;
  login(): Promise<string>;
}

export type PlatformSpecificAPI =
  | {
      name: Lowercase<TaroGeneral.ENV_TYPE.WEAPP>;
      File: typeof TaroFSFile;
    }
  | {
      name: Lowercase<TaroGeneral.ENV_TYPE.WEB>;
      File: typeof WebFile;
    };

export type Platform = CommonAPI & PlatformSpecificAPI;

export abstract class CommonFile {
  public abstract readonly name: string;
  public abstract readonly size: number;

  public abstract getType(): Promise<FileTypeResult | undefined>;
  public abstract getMD5(): Promise<string>;

  public abstract readBytes(
    offset: number,
    length?: number,
  ): Promise<ArrayBuffer>;

  public abstract toBlob(): Promise<Blob>;
}

export interface GetPrivacySettingResult {
  needAuthorization: boolean;
  privacyContractName: string;
}

export interface OpenSettingResult {
  authSetting: Taro.openSetting.SuccessCallbackResult["authSetting"];
  subscriptionsSetting?: Taro.openSetting.SuccessCallbackResult["subscriptionsSetting"];
}

export type SubscribeStatus = "enabled" | "disabled" | "unconfigured";

export interface SubscribeNotificationResult {
  [TEMPLATE_ID: string]: boolean;
}
