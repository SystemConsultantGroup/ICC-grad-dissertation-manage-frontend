import { CommonApiResponse, Stage } from "./common";

export interface File {
  uuid: string;
  name: string;
  mimeType: string;
}

export interface FileResponse extends File, CommonApiResponse {}

export type ReuploadStatus = "MISSING" | "REUPLOADED" | "OK";

export interface ReuploadTarget {
  thesisFileId: number;
  stage: Stage;
  type: "THESIS" | "PRESENTATION" | "REVISION_REPORT";
  file: File & { createdAt: string };
  status: ReuploadStatus;
  reuploadedAt: string | null;
  reuploadedName: string | null;
}

export interface ReuploadTargetResponse extends CommonApiResponse {
  items: ReuploadTarget[];
}
