type ApiId = number | string;

// API endpoint 를 모두 모아두는 파일
export const API_ROUTES = {
  file: {
    excel: {
      professor: () => "/files/excels/professor", // GET: 교수 일괄 업로드 양식 다운로드
      student: () => "/files/excels/student", // GET: 학생 일괄 업로드 양식 다운로드
    },
    get: (uuid: ApiId) => `/files/${uuid}`,
    post: () => "/files", // POST: 파일 업로드
    delete: (uuid: ApiId) => `/files/${uuid}`, // DELETE: 파일 삭제
    reupload: {
      getMe: () => "/files/reupload/me", // GET: 재업로드 대상 파일 조회 (학생)
      getAll: () => "/files/reupload", // GET: 전체 학생 재업로드 현황 (관리자)
      put: (uuid: ApiId) => `/files/reupload/${uuid}`, // PUT: 유실된 제출 파일 재업로드 (학생)
    },
  },
  phase: {
    get: () => "/phases", // GET: 시스템 일정 목록 조회
    getCurrent: () => "/phases/current", // GET: 현재 시스템 일정 조회
    put: (phaseId: ApiId) => `/phases/${phaseId}`, // PUT: 시스템 일정 수정 (관리자)
  },
  department: {
    get: () => "/departments",
    post: () => "/departments",
    delete: (deptId: ApiId) => `/departments/${deptId}`,
    put: (deptId: ApiId, exclude: boolean) =>
      `/departments/${deptId}?exclude=${exclude ? "true" : "false"}`,
  },
  user: {
    get: () => "/users/me", // GET: 유저 정보 조회
    put: () => "/users/me", // PUT: 유저 정보 수정
  },
  professor: {
    get: (professorId?: ApiId) => `/professors/${professorId ?? ""}`, // GET: 교수 목록 및 상세 조회
    post: () => "/professors", // POST: 교수 생성 (관리자)
    put: (professorId: ApiId) => `/professors/${professorId}`, // PUT: 교수 정보 수정 (관리자)
    excel: {
      get: () => "/professors/excel", // GET: 교수 일괄 다운로드 (관리자)
      post: () => "/professors/excel", // POST: 교수 일괄 업로드 (관리자)
    },
    delete: (professorId?: ApiId) => `/professors/${professorId ?? ""}`, // DELETE: 교수 일괄 삭제 맟 특정 교수 삭제
  },
  student: {
    get: (studentId?: ApiId | null) => `/students/${studentId ?? ""}`, // GET: 학생 목록 및 상세 조회
    post: () => "/students", // POST: 학생 생성 (관리자)
    phd: () => "/students/phd", // POST: 박사 과정 학생 생성 (관리자)
    put: (studentId: ApiId) => `/students/${studentId}`, // PUT: 학생 정보 수정 (학생 및 관리자)
    excel: {
      get: () => "/students/excel", // GET: 학생 일괄 다운로드 (관리자)
      post: () => "/students/excel", // POST: 학생 일괄 업로드 (관리자)
      phd: () => "/students/excel/phd", // POST: 박사 과정 학생 일괄 업로드 (관리자)
    },
    getSystem: (studentId: ApiId) => `/students/${studentId}/system`, // GET: 학생 시스템 정보 조회
    putSystem: (studentId: ApiId) => `/students/${studentId}/system`, // PUT: 학생 시스템 정보 수정
    getThesis: (studentId: ApiId) => `/students/${studentId}/thesis`, // GET: 학생 논문 정보 조회
    putThesis: (studentId: ApiId) => `/students/${studentId}/thesis`, // PUT: 학생 논문 정보 수정
    getReviewer: (studentId: ApiId) => `/students/${studentId}/reviewers`, // GET: 학생 심사위원 목록 조회
    putReviewer: (studentId: ApiId, reviewerId: ApiId) =>
      `/students/${studentId}/reviewers/${reviewerId}`, // PUT: 학생 심사위원 배정
    putHeadReviewer: (studentId: ApiId, reviewerId: ApiId) =>
      `/students/${studentId}/headReviewer/${reviewerId}`, // PUT: 학생 심사위원장 배정
    deleteReviewer: (studentId: ApiId, reviewerId: ApiId) =>
      `/students/${studentId}/reviewers/${reviewerId}`, // PUT: 학생 심사위원 배정 취소
    delete: (studentId?: ApiId) => `/students/${studentId ?? ""}`, // DELETE: 학생 삭제
  },
  review: {
    // 학생 본인의 논문 조회
    getMe: () => "/reviews/me",

    // 교수 심사 대상 조회: '논문 심사'
    get: (reviewId?: ApiId) => `/reviews/${reviewId ?? ""}`, // GET: 심사 대상 논문 목록 조회 및 상세 조회(교수)
    put: (reviewId: ApiId) => `/reviews/${reviewId}`, // PUT: 논문 심사 등록/수정(교수)
    excel: () => "/reviews/excel", // GET: 심사 대상 논문 리스트 다운로드

    current: {
      // 관리자 논문 조회: '심사 현황'
      get: (thesisId?: ApiId) => `/reviews/current/${thesisId ?? ""}`,
      excel: () => "/reviews/current/excel",
    },
    final: {
      // 교수 심사 대상 조회: '최종 판정'
      get: (reviewId?: ApiId) => `/reviews/final/${reviewId ?? ""}`, // GET: 최종 심사 대상 논문 목록 조회 및 상세 조회
      put: (reviewId?: ApiId) => `/reviews/final/${reviewId ?? ""}`, // GET: 최종 심사 대상 논문 목록 조회 및 상세 조회
      excel: () => "/reviews/final/excel", // GET: 최종 심사 대상 논문 리스트 다운로드
    },
    result: {
      // 관리자 논문 조회: '심사 결과'
      get: (thesisId?: ApiId) => `/reviews/result/${thesisId ?? ""}`, // GET: 심사 결과 목록 조회
      excel: () => "/reviews/result/excel", // GET: 심사 결과 엑셀 다운로드
      report: () => "/reviews/result/reports", // GET: 전체 심사보고서 다운로드
    },
    revision: {
      // 교수 심사 대상 조회: '수정사항 확인'
      get: (reviewId?: ApiId) => `/reviews/revision/${reviewId ?? ""}`, // GET: 수정지시사항 목록 조회 및 상세 조회
      put: (reviewId: ApiId) => `/reviews/revision/${reviewId}`, // PUT: 수정지시사항 심사 등록/수정
    },
  },
  thesis: {
    // 백엔드 api 경로 오타로 theses로 설정
    put: (thesisId: ApiId) => `/theses/${thesisId}`,
  },
  achievement: {
    get: (achievementId?: ApiId) => `/achievements/${achievementId ?? ""}`,
    put: (achievementId: ApiId) => `/achievements/${achievementId}`,
    post: () => "/achievements",
    delete: (achievementId: ApiId) => `/achievements/${achievementId}`,
    excel: () => "/achievements/excel",
  },
};
