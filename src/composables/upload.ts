import axios from "axios";
import { useAPI } from "@/composables/api";
import { platform } from "@/platforms";
import { File } from "@/types";
import {
  type CommonFile,
  getErrMsg,
  toLowerCase,
  uint8ArrayToHex,
} from "@/utils";

const API = useAPI();

const upload = async (fileToUpload: File.FileUpload, projectId: number) => {
  if (!fileToUpload.file)
    throw new UploadError(UploadErrors.Unknown, "上传失败: 文件不存在");
  if (!fileToUpload.abort) fileToUpload.abort = new AbortController();
  const { file, abort } = fileToUpload;

  fileToUpload.status = File.UploadStatus.Initialization;
  const md5 = await file.getMD5();
  const head = uint8ArrayToHex(new Uint8Array(await file.readBytes(0, 12)));
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
          `${file.name} 上传失败:\n不支持的文件类型`,
        );
    }
    const { file_id: id, presigned_req: presignedRequest } = res.File;
    fileToUpload.status = File.UploadStatus.Uploading;
    await uploadFile(file, presignedRequest, abort.signal);
    const result = await API.uploadFileFinish({ Finish: { file_id: id } });
    if (result === "UploadNotFinish") {
      await continueUpload(file, id, abort);
    }
    fileToUpload.status = File.UploadStatus.Success;
    return id;
  } catch (err) {
    fileToUpload.status = File.UploadStatus.Error;
    if (fileToUpload.id) {
      void API.deleteFile({ file_id: fileToUpload.id });
    }

    if (abort.signal.aborted) {
      throw new UploadError(UploadErrors.Cancelled, `取消上传 ${file.name}`);
    } else if (err instanceof UploadError) {
      throw err;
    } else {
      throw new UploadError(
        UploadErrors.Unknown,
        `上传失败:\n${getErrMsg(err)}`,
      );
    }
  }
};

const continueUpload = async (
  file: CommonFile,
  id: number,
  abort: AbortController,
) => {
  const { presigned_req: presignedRequest } = (
    await API.uploadFileContinue({ Continue: { file_id: id } })
  ).Continue;
  await uploadFile(file, presignedRequest, abort.signal);
  const result = await API.uploadFileFinish({
    Finish: {
      file_id: id,
    },
  });
  if (result !== "Success") throw new Error(result);
  return;
};

const uploadFile = async (
  file: CommonFile,
  presignedRequest: File.PresignedRequest<"POST" | "PUT" | "PATCH">,
  abortSignal: AbortSignal,
  maxRetries = 2,
) => {
  const { headers, method, uri } = presignedRequest;
  const data = file.toBlob();
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
