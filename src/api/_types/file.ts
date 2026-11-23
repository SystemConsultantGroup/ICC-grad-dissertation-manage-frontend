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

export interface AdminReuploadFile {
  thesisFileId: number;
  stage: Stage;
  type: ReuploadTarget["type"];
  fileName: string | null;
  status: ReuploadStatus;
  reuploadedAt: string | null;
}

export interface AdminReuploadStudent {
  studentId: number;
  loginId: string;
  name: string;
  department: string | null;
  missingCount: number;
  reuploadedCount: number;
  okCount: number;
  lastReuploadedAt: string | null;
  files: AdminReuploadFile[];
}

export interface AdminReuploadSummary {
  studentCount: number;
  affectedStudentCount: number;
  completedStudentCount: number;
  missingFileCount: number;
  reuploadedFileCount: number;
}

export interface AdminReuploadStatusResponse extends CommonApiResponse {
  summary: AdminReuploadSummary;
  items: AdminReuploadStudent[];
}
