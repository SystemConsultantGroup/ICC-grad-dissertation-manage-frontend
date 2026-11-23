"use client";

import { ReactNode, useState } from "react";
import { Badge, Box, Button, Checkbox, FileInput, Group, Loader, Stack, Text } from "@mantine/core";
import { IconInfoCircle, IconMessageQuestion, IconUpload } from "@tabler/icons-react";
import { RowGroup, TitleRow } from "@/components/common/rows";
import Row from "@/components/common/rows/_elements/Row/Row";
import { ClientAxios } from "@/api/ClientAxios";
import { API_ROUTES } from "@/api/apiRoute";
import { STAGE_LOOKUP_TABLE } from "@/api/_types/common";
import { ReuploadStatus, ReuploadTarget } from "@/api/_types/file";
import useReuploadTargets from "@/api/SWR/useReuploadTargets";
import { formatTime } from "@/components/common/Clock/date/format";
import { showNotificationSuccess } from "@/components/common/Notifications";

const FILE_TYPE_LABEL: Record<ReuploadTarget["type"], string> = {
  THESIS: "논문 파일",
  PRESENTATION: "논문 발표 파일",
  REVISION_REPORT: "수정 사항 보고서",
};

const STATUS_BADGE: Record<ReuploadStatus, { color: string; label: string }> = {
  MISSING: { color: "red", label: "재업로드 필요" },
  REUPLOADED: { color: "green", label: "재업로드 완료" },
  OK: { color: "gray", label: "정상 보관" },
};

const getExtension = (name: string) => {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
};

/**
 * 공통 NoticeRow 는 한 줄 안내용이라 위아래 여백이 없어,
 * 여러 줄 안내에 맞게 여백과 아이콘 정렬만 조정한 행.
 */
function NoticeBlock({
  icon,
  children,
  withBorderBottom = true,
}: {
  icon: ReactNode;
  children: ReactNode;
  withBorderBottom?: boolean;
}) {
  return (
    <RowGroup py="md" withBorderBottom={withBorderBottom}>
      <Group gap="md" align="flex-start" wrap="nowrap">
        <Box pt={2} style={{ flexShrink: 0, lineHeight: 0 }}>
          {icon}
        </Box>
        {children}
      </Group>
    </RowGroup>
  );
}

function ReuploadForm() {
  const { data: targets, isLoading, mutate } = useReuploadTargets();
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [uploadingUUID, setUploadingUUID] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const missingCount = targets?.filter((target) => target.status === "MISSING").length ?? 0;
  const actionableCount = targets?.filter((target) => target.status !== "OK").length ?? 0;

  const handleUpload = async (target: ReuploadTarget) => {
    const file = selectedFiles[target.file.uuid];
    if (!file) return;

    setUploadingUUID(target.file.uuid);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await ClientAxios.put(API_ROUTES.file.reupload.put(target.file.uuid), formData);

      showNotificationSuccess({
        title: "재업로드 완료",
        message: `${STAGE_LOOKUP_TABLE[target.stage]} ${
          FILE_TYPE_LABEL[target.type]
        }이(가) 다시 제출되었습니다.`,
      });
      setSelectedFiles((prev) => ({ ...prev, [target.file.uuid]: null }));
      await mutate();
    } catch (error) {
      // 오류 메시지는 ClientAxios 인터셉터가 알림으로 표시합니다.
    } finally {
      setUploadingUUID(null);
    }
  };

  return (
    <Stack gap={0}>
      <TitleRow
        title="제출 파일 재업로드"
        badge={
          isLoading ? undefined : missingCount > 0 ? (
            <Badge color="red">재업로드 필요 {missingCount}건</Badge>
          ) : (
            <Badge color="green">재업로드할 파일 없음</Badge>
          )
        }
      />
      <NoticeBlock icon={<IconInfoCircle size={24} />}>
        <Stack gap={6}>
          <Text>
            논문 관리 시스템 저장 서버 장애로 제출하신 파일의 사본 일부를 다시 받고 있습니다.
          </Text>
          <Text>
            제출 기록, 최초 제출 시각, 심사 진행 상황은 모두 그대로 유지되며 재업로드로 인한
            불이익은 없습니다.
          </Text>
          <Text fw={600}>당시 제출하신 파일과 동일한 파일을 올려 주세요.</Text>
        </Stack>
      </NoticeBlock>

      {isLoading && (
        <RowGroup py="lg">
          <Group justify="center" w="100%">
            <Loader size="sm" />
          </Group>
        </RowGroup>
      )}

      {!isLoading && targets?.length === 0 && (
        <NoticeBlock icon={<IconInfoCircle size={24} />}>
          <Text>제출하신 파일이 없어 재업로드할 항목이 없습니다.</Text>
        </NoticeBlock>
      )}

      {!isLoading && actionableCount > 0 && (
        <RowGroup py="md">
          <Checkbox
            checked={confirmed}
            onChange={(event) => setConfirmed(event.currentTarget.checked)}
            label="재업로드하는 파일이 당시 제출한 파일과 동일한 파일임을 확인합니다."
          />
        </RowGroup>
      )}

      {targets?.map((target) => {
        const { uuid, name, createdAt } = target.file;
        const badge = STATUS_BADGE[target.status];
        const selectedFile = selectedFiles[uuid] ?? null;
        const extension = getExtension(name);

        return (
          <RowGroup key={uuid} py="lg">
            <Row
              field={`${STAGE_LOOKUP_TABLE[target.stage]} ${FILE_TYPE_LABEL[target.type]}`}
              fieldSize="lg"
              flexStart
            >
              <Stack gap={12}>
                <Stack gap={4}>
                  <Group gap={8}>
                    <Badge color={badge.color} variant="light">
                      {badge.label}
                    </Badge>
                    <Text fw={500}>{name}</Text>
                  </Group>
                  <Text size="sm" c="dimmed">
                    최초 제출: {formatTime(new Date(createdAt))}
                    {target.reuploadedAt &&
                      ` · 재업로드: ${formatTime(new Date(target.reuploadedAt))} (${
                        target.reuploadedName
                      })`}
                  </Text>
                </Stack>
                {target.status !== "OK" && (
                  <Group gap={16}>
                    <FileInput
                      style={{ width: 300 }}
                      placeholder={extension ? `${extension} 파일 선택...` : "파일 업로드..."}
                      accept={extension || undefined}
                      clearable
                      value={selectedFile}
                      onChange={(file) =>
                        setSelectedFiles((prev) => ({ ...prev, [uuid]: file as File | null }))
                      }
                      disabled={uploadingUUID !== null}
                    />
                    <Button
                      leftSection={<IconUpload size={20} />}
                      disabled={!confirmed || !selectedFile || uploadingUUID !== null}
                      loading={uploadingUUID === uuid}
                      onClick={() => handleUpload(target)}
                    >
                      {target.status === "REUPLOADED" ? "다시 올리기" : "재업로드"}
                    </Button>
                  </Group>
                )}
              </Stack>
            </Row>
          </RowGroup>
        );
      })}

      <NoticeBlock icon={<IconMessageQuestion size={24} />} withBorderBottom={false}>
        <Text size="sm">
          원본 파일이 없으시거나 업로드에 문제가 있는 등 기타 문의 사항은 관할 행정실로 문의해
          주세요.
        </Text>
      </NoticeBlock>
    </Stack>
  );
}

export default ReuploadForm;
