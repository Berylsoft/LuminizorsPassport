import axios from "axios";
import { useAPI } from "@/composables/api";
import { useAttachmentStore } from "@/stores/attachment";
import { platform } from "@/platforms";
import { getErrMsg, readBytesFromStream, TaroFS, toLowerCase } from "@/utils";
import Taro from "@tarojs/taro";

const API = useAPI();

export type AttachmentStatus = "unstart" | "downloading" | "downloaded";
const getAttachmentStatus = async (
  projectId: number,
): Promise<AttachmentStatus> => {
  const attachmentStore = useAttachmentStore();
  switch (platform.name) {
    case "web":
      return "unstart";
    default: {
      const attachment = attachmentStore.localAttachments[projectId];
      if (attachment) {
        const { size } = (await TaroFS.stat({ path: attachment.path }))
          .stats as Taro.Stats;
        if (size === attachment.size) {
          return "downloaded";
        } else {
          Reflect.deleteProperty(attachmentStore.localAttachments, projectId);
        }
      }
      return "unstart";
    }
  }
};

const downloadAttachment = async (
  projectId: number,
  abort: AbortSignal,
  onProgress?: (progress: number) => void,
) => {
  const presignedRequest = (
    await API.getAttachment({ pid: projectId }, { signal: abort })
  ).presigned_req;
  const { method, uri, headers } = presignedRequest;
  const res = await axios[toLowerCase(method)]<
    ReadableStream<Uint8Array<ArrayBuffer>>
  >(uri, {
    headers: Object.fromEntries(headers),
    signal: abort,
    responseType: "stream",
  });
  const stream = res.data;
  const totalLength = Number(res.headers["Content-Length"]);

  try {
    switch (platform.name) {
      case "web": {
        const url = URL.createObjectURL(
          new Blob([await readBytesFromStream(stream)]),
        );
        return {
          open: () => open(url, "_blank"),
        };
      }
      default: {
        const reader = stream.getReader();
        const dir = `${Taro.env.USER_DATA_PATH!}/attachments/${projectId.toString()}`;
        const fileName = presignedRequest.uri.split("/").pop()!;

        try {
          await TaroFS.access({ path: dir });
          await TaroFS.rmdir({ dirPath: dir, recursive: true });
        } catch {
          /* empty */
        }
        await TaroFS.mkdir({
          dirPath: dir,
          recursive: true,
        });
        const path = `${dir}/${fileName}`;
        const { fd } = await TaroFS.open({
          filePath: path,
          flag: "w",
        });

        try {
          let receivedLength = 0;
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            await TaroFS.write({
              fd,
              data: value.buffer,
              offset: value.byteOffset,
              length: value.byteLength,
              position: receivedLength,
            });
            receivedLength += value.byteLength;
            if (totalLength) onProgress?.(receivedLength / totalLength);
          }
          const attachmentStore = useAttachmentStore();
          attachmentStore.localAttachments[projectId] = {
            path,
            size: receivedLength,
          };
          return {
            open: () => {
              if (Taro.canIUse("saveFileToDisk")) {
                void Taro.saveFileToDisk({ filePath: path });
              } else {
                void Taro.openDocument({ filePath: path, showMenu: true });
              }
            },
          };
        } finally {
          await TaroFS.close({ fd });
        }
      }
    }
  } catch (err) {
    if (abort.aborted) {
      void platform.showToast({ title: "附件下载已取消" });
    } else {
      void platform.showToast({ title: `附件下载失败: ${getErrMsg(err)}` });
    }
    throw err;
  } finally {
    await stream.cancel();
  }
};

export const useAttachment = () => ({
  getAttachmentStatus,
  downloadAttachment,
});
