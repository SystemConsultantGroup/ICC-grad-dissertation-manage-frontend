import { TableHeaderProps } from "@/components/common/Table/_elements/TableHeader";

export const STUDENTS_TABLE_HEADERS: TableHeaderProps[] = [
  { label: "순번", widthPercentage: 5 },
  { label: "아이디", widthPercentage: 10 },
  { label: "이름", widthPercentage: 10 },
  { label: "이메일", widthPercentage: 15 },
  { label: "연락처", widthPercentage: 10 },
  { label: "학과", widthPercentage: 10 },
];

export const PROF_TABLE_HEADERS: TableHeaderProps[] = [
  { label: "순번", widthPercentage: 5 },
  { label: "아이디", widthPercentage: 10 },
  { label: "이름", widthPercentage: 10 },
  { label: "이메일", widthPercentage: 15 },
  { label: "연락처", widthPercentage: 10 },
  { label: "소속", widthPercentage: 10 },
];

export const PROF_REVIEW_TABLE_HEADERS: TableHeaderProps[] = [
  { label: "순번", widthPercentage: 5 },
  { label: "구분", widthPercentage: 7 },
  { label: "저자", widthPercentage: 7 },
  { label: "학과", widthPercentage: 15 },
  { label: "논문 제목", widthPercentage: 35 },
  { label: "심사 구분", widthPercentage: 7 },
  { label: "심사 현황", widthPercentage: 7 },
];

export const REVIEW_RESULT_TABLE_HEADERS: TableHeaderProps[] = [
  { label: "순번", widthPercentage: 5 },
  { label: "구분", widthPercentage: 7 },
  { label: "저자", widthPercentage: 7 },
  { label: "학과", widthPercentage: 10 },
  { label: "논문 제목", widthPercentage: 35 },
  { label: "심사 결과", widthPercentage: 15 },
];

export const STUDENT_ACHIEVEMENT_TABLE_HEADERS: TableHeaderProps[] = [
  { label: "순번", widthPercentage: 5 },
  { label: "논문 제목", widthPercentage: 15 },
  { label: "실적 구분", widthPercentage: 7 },
  { label: "학술지명", widthPercentage: 7 },
  { label: "ISSN", widthPercentage: 7 },
  { label: "게재년월일", widthPercentage: 7 },
  { label: "주저자여부", widthPercentage: 7 },
  { label: "저자 수", widthPercentage: 5 },
];

export const ACHIEVEMENT_TABLE_HEADERS: TableHeaderProps[] = [
  { label: "순번", widthPercentage: 5 },
  { label: "학과", widthPercentage: 15 },
  { label: "저자", widthPercentage: 7 },
  { label: "논문 제목", widthPercentage: 25 },
  { label: "실적 구분", widthPercentage: 7 },
  { label: "학술지명", widthPercentage: 7 },
  { label: "ISSN", widthPercentage: 7 },
  { label: "게재년월일", widthPercentage: 7 },
  { label: "주저자여부", widthPercentage: 7 },
  { label: "저자 수", widthPercentage: 5 },
];

export const PROF_REVISION_TABLE_HEADERS: TableHeaderProps[] = [
  { label: "순번", widthPercentage: 5 },
  { label: "학과", widthPercentage: 15 },
  { label: "저자", widthPercentage: 7 },
  { label: "논문 제목", widthPercentage: 25 },
  { label: "확인 여부", widthPercentage: 7 },
];

export const REUPLOAD_STATUS_TABLE_HEADERS: TableHeaderProps[] = [
  { label: "순번", widthPercentage: 6 },
  { label: "학번", widthPercentage: 12 },
  { label: "이름", widthPercentage: 10 },
  { label: "학과", widthPercentage: 22 },
  { label: "남은 파일", widthPercentage: 9 },
  { label: "완료 파일", widthPercentage: 9 },
  { label: "상태", widthPercentage: 10 },
  { label: "최근 재업로드", widthPercentage: 16 },
];

export const SIGN_REUPLOAD_STATUS_TABLE_HEADERS: TableHeaderProps[] = [
  { label: "순번", widthPercentage: 6 },
  { label: "아이디", widthPercentage: 12 },
  { label: "이름", widthPercentage: 10 },
  { label: "학과", widthPercentage: 20 },
  { label: "이메일", widthPercentage: 18 },
  { label: "심사 학생", widthPercentage: 8 },
  { label: "서명 상태", widthPercentage: 10 },
  { label: "서명 업로드", widthPercentage: 16 },
];
