import axios from "axios";
import { useAPI } from "@/composables/api";
import { useConfig } from "@/composables/config";
import { platform } from "@/platforms";
import type { File } from "@/types";
import { readBytesFromStream, toLowerCase, uint8ArrayToHex } from "@/utils";

const API = useAPI();
const config = useConfig();

const upload = async (
  file: File.File,
  options: {
    abortSignal: AbortSignal;
    projectId: number;
  },
) => {
  const { projectId, abortSignal } = options;
  const md5 = await file.calcMD5();
  const stream = file.stream();
  const head = uint8ArrayToHex(await readBytesFromStream(stream, 12));
  await stream.cancel();
  try {
    const res = await API.uploadFileStart({
      Start: {
        pid: projectId,
        name: file.name,
        size: file.size,
        md5,
        head,
      },
    });
    switch (res) {
      case "CapacityReached":
        throw new UploadError(
          UploadErrors.CapacityReached,
          `${file.name} 上传失败:\n已上传文件大小达到上限, 请先删除不必要的文件`,
        );
      case "CountReached":
        throw new UploadError(
          UploadErrors.CountReached,
          `${file.name} 上传失败:\n已上传文件数量达到上限, 请先删除不必要的文件`,
        );
      case "InvalidFileName":
        throw new UploadError(
          UploadErrors.InvalidFileName,
          `${file.name} 上传失败:\n文件名不合法, 请修改文件名后重试`,
        );
      case "InvalidFileType":
        throw new UploadError(
          UploadErrors.InvalidFileType,
          `${file.name} 上传失败:\n文件类型不受支持, 仅支持${config.upload.acceptedExtensions.join()}`,
        );
    }
    const { file_id: id, presigned_req: presignedRequest } = res.File;
    await uploadFile(file, presignedRequest, abortSignal);
    const result = await API.uploadFileFinish({ Finish: { file_id: id } });
    if (result === "UploadNotFinish") {
      await continueUpload(file, id, abortSignal);
    }
    return id;
  } catch (err) {
    if (abortSignal.aborted) {
      throw new UploadError(UploadErrors.Cancelled, `取消上传 ${file.name}`);
    } else if (err instanceof UploadError) {
      throw err;
    } else {
      const msg =
        err instanceof Error
          ? err.message
          : (err?.toString() ?? "Unknown error");
      throw new UploadError(UploadErrors.Unknown, `上传失败:\n${msg}`);
    }
  }
};

const continueUpload = async (
  file: File.File,
  id: number,
  abortSignal: AbortSignal,
) => {
  const { presigned_req: presignedRequest } = (
    await API.uploadFileContinue({ Continue: { file_id: id } })
  ).Continue;
  await uploadFile(file, presignedRequest, abortSignal);
  const result = await API.uploadFileFinish({
    Finish: {
      file_id: id,
    },
  });
  if (result !== "Success") throw new Error(result);
  return;
};

const uploadFile = async (
  file: File.File,
  presignedRequest: File.PresignedRequest,
  abortSignal: AbortSignal,
  maxRetries = 2,
) => {
  const { headers, method, uri } = presignedRequest;
  const stream = file.stream();
  const data = new Blob([(await readBytesFromStream(stream)).buffer]);
  await stream.cancel();
  try {
    await axios[toLowerCase(method)](uri, data, {
      headers: Object.fromEntries(headers),
      signal: abortSignal,
    });
  } catch (err) {
    if (maxRetries > 0) {
      void platform.showToast({
        title: `${file.name}\n传输失败，正在重试`,
      });
      await uploadFile(file, presignedRequest, abortSignal, maxRetries - 1);
    } else {
      throw err;
    }
  }
};

export const useUpload = () => ({ upload });

export enum UploadErrors {
  Cancelled,
  CapacityReached,
  CountReached,
  InvalidFileName,
  InvalidFileType,
  Unknown,
}
export class UploadError extends Error {
  public type: UploadErrors;
  constructor(type: UploadErrors, ...params: Parameters<ErrorConstructor>) {
    super(...params);
    this.name = "UploadError";
    this.type = type;
  }
}
