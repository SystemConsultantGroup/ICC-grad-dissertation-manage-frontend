import { PagedApiResponse, PagedQueryRequest } from "./common";

export type AchievementType =
  | "SCI"
  | "SCOPUS"
  | "SCIE"
  | "INTERNATIONAL_B"
  | "DOMESTIC_A"
  | "DOMESTIC_B"
  | "ICOP"
  | "ICP"
  | "DCOP"
  | "DCP"
  | "IPR"
  | "IPA"
  | "DPR"
  | "DPA";

export type AchievementAuthorType =
  | "FIRST_AUTHOR"
  | "CO_FIRST_AUTHOR"
  | "CORRESPONDING_AUTHOR"
  | "FIRST_CORRESPONDING_AUTHOR"
  | "CO_AUTHOR";

export type AchievementTypeLookupTable = Record<AchievementType, string>;

export type AchievementAuthorTypeLookupTable = Record<AchievementAuthorType, string>;

export const ACHIEVEMENT_TYPE_LOOKUP_TABLE: AchievementTypeLookupTable = {
  SCI: "SCI",
  SCOPUS: "SCOPUS",
  SCIE: "우수국제(Top-Tier) 학술대회(Top-tier Conference list)",
  INTERNATIONAL_B: "국제 B급 학술지(International B Journal)",
  DOMESTIC_A: "KCI 등재지(KCI Journal)",
  DOMESTIC_B: "국내 B급 학술지(Domestic B Journal)",
  ICOP: "국제 학술대회 구두발표(International Conference Oral presentation)",
  ICP: "국제 학술대회 포스터(International Conference Poster)",
  DCOP: "국내 학술대회 구두발표(Domestic Conference Oral presentation)",
  DCP: "국내 학술대회 포스터(Domestic Conference Poster)",
  IPR: "국제특허등록(International Patent Registration)",
  IPA: "국제특허출원(International Patent Application)",
  DPR: "국내특허등록(Domestic Patent Registration )",
  DPA: "국내특허출원(Domestic Patent Application)",
};

export const ACHIEVEMENT_AUTHOR_TYPE_LOOKUP_TABLE: AchievementAuthorTypeLookupTable = {
  FIRST_AUTHOR: "제1저자(1st author)",
  CO_FIRST_AUTHOR: "공동1저자(Co- 1st author)",
  CORRESPONDING_AUTHOR: "교신저자(Corresponding Author)",
  FIRST_CORRESPONDING_AUTHOR: "제1교신저자(1st Corresponding Author)",
  CO_AUTHOR: "공저자(Co-Author)",
};

export interface Achievement {
  performance: AchievementType;
  journalName: string;
  authorNumbers: number;
  authorType: AchievementAuthorType;
  ISSN?: string;
  name: string;
  id: number;
  department: string;
  publicationDate: string;
  paperTitle: string;
}

export interface PagedAchievementResponse extends PagedApiResponse<Achievement> {}
export type PagedAchievementRequestQuery = PagedQueryRequest &
  Partial<
    Omit<Achievement, "name" | "id" | "department" | "ISSN" | "authorNumbers" | "authorType"> & {
      studentNumber: string;
      author: string;
      departmentId: string;
    }
  >;
