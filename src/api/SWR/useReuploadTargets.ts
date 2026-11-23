"use client";

import { API_ROUTES } from "@/api/apiRoute";
import { useAuth } from "@/components/common/AuthProvider";
import { ReuploadTargetResponse } from "@/api/_types/file";
import { useConditionalSWR } from "./useConditionalSWR";

/**
 * @description 학생 본인의 재업로드 대상 파일 조회
 * @param shouldFetch true면 fetch, false면 fetch하지 않음
 */
function useReuploadTargets(shouldFetch = true) {
  const { token } = useAuth();

  const result = useConditionalSWR<ReuploadTargetResponse>(
    { url: API_ROUTES.file.reupload.getMe(), token },
    !!token && shouldFetch
  );

  return {
    data: result.data?.items,
    get isLoading() {
      return result.isLoading;
    },
    get error() {
      return result.error;
    },
    get mutate() {
      return result.mutate;
    },
  };
}

export default useReuploadTargets;
