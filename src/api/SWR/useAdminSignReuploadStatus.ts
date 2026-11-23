"use client";

import useSWR from "swr";
import { API_ROUTES } from "@/api/apiRoute";
import { useAuth } from "@/components/common/AuthProvider";
import { AdminSignReuploadStatusResponse } from "@/api/_types/file";

/**
 * @description 교수 서명(도장) 재업로드 현황 조회 (관리자)
 * 서버가 저장소를 직접 확인하는 요청이라 포커스 시 자동 재조회는 끈다.
 */
function useAdminSignReuploadStatus() {
  const { token } = useAuth();

  const result = useSWR<AdminSignReuploadStatusResponse>(
    token ? { url: API_ROUTES.file.reupload.getSigns(), token } : null,
    { revalidateOnFocus: false }
  );

  return {
    summary: result.data?.summary,
    data: result.data?.items,
    get isLoading() {
      return result.isLoading;
    },
    get isValidating() {
      return result.isValidating;
    },
    get error() {
      return result.error;
    },
    get mutate() {
      return result.mutate;
    },
  };
}

export default useAdminSignReuploadStatus;
