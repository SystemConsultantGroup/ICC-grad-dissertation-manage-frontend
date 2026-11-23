"use client";

import Link from "next/link";
import { Alert, Button, Group, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import useReuploadTargets from "@/api/SWR/useReuploadTargets";

/** 학생 메인에서 재업로드가 필요한 파일이 있을 때만 안내를 띄운다. */
function ReuploadAlert() {
  const { data: targets } = useReuploadTargets();
  const missingCount = targets?.filter((target) => target.status === "MISSING").length ?? 0;

  if (missingCount === 0) return null;

  return (
    <Alert
      color="red"
      variant="light"
      icon={<IconAlertTriangle />}
      title="제출 파일 재업로드 요청"
      mb="md"
    >
      <Group justify="space-between" align="center">
        <Text size="sm">
          저장 서버 장애로 제출하신 파일 {missingCount}건을 다시 받고 있습니다. 제출 기록과 심사
          진행에는 영향이 없습니다.
        </Text>
        <Button component={Link} href="/student/reupload" size="xs" color="red">
          재업로드하러 가기
        </Button>
      </Group>
    </Alert>
  );
}

export default ReuploadAlert;
