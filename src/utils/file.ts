import {
  fileTypeFromBlob,
  fileTypeFromStream,
  type FileTypeResult,
} from "file-type";
import { md5 } from "hash-wasm";
import { TaroFS } from "./fs";
import { createReadableStream } from "./misc";

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

export class WebFile extends CommonFile {
  private file: File;
  public readonly name: string;
  public readonly size: number;

  constructor(file: File) {
    super();
    this.file = file;
    this.name = file.name;
    this.size = file.size;
  }

  public getType() {
    return fileTypeFromBlob(this.file);
  }

  public async getMD5() {
    return md5(await this.file.bytes());
  }

  public readBytes(offset: number, length?: number) {
    return this.file
      .slice(offset, length ? offset + length : this.size)
      .arrayBuffer();
  }

  public toBlob() {
    return Promise.resolve(this.file);
  }
}

export class TaroFSFile extends CommonFile {
  private path: string;
  public readonly name: string;
  public readonly size: number;
  constructor(options: { name: string; path: string; size: number }) {
    super();
    this.name = options.name;
    this.size = options.size;
    this.path = options.path;
  }

  public async getType() {
    const stream = createReadableStream(this.path);
    try {
      return await fileTypeFromStream(stream);
    } finally {
      await stream.cancel();
    }
  }

  public async getMD5() {
    return (
      await TaroFS.getFileInfo({
        filePath: this.path,
        digestAlgorithm: "md5",
      })
    ).digest!;
  }

  public async readBytes(offset: number, length?: number) {
    const { data } = await TaroFS.readFile({
      filePath: this.path,
      encoding: "binary",
      position: offset,
      ...(length === undefined ? {} : { length }),
    });
    return data as ArrayBuffer;
  }

  public async toBlob() {
    const { data } = await TaroFS.readFile({
      filePath: this.path,
      encoding: "binary",
    });
    return new Blob([data]);
  }
}
