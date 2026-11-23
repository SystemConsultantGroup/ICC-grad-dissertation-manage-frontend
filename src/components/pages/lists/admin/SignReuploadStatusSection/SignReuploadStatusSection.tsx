"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  SegmentedControl,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  TableTd,
  TableTr,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { IconDownload, IconRefresh, IconSearch } from "@tabler/icons-react";
import { Table } from "@/components/common/Table";
import { useAdminSignReuploadStatus } from "@/api/SWR";
import { AdminSignReuploadProfessor, SignReuploadStatus } from "@/api/_types/file";
import { DATE_TIME_FORMAT_HYPHEN } from "@/constants/date";
import { SIGN_REUPLOAD_STATUS_TABLE_HEADERS } from "../../_constants/table";

type Filter = SignReuploadStatus | "ALL";

const FILTER_OPTIONS: { label: string; value: Filter }[] = [
  { label: "재업로드 필요", value: "MISSING" },
  { label: "등록 완료", value: "UPLOADED" },
  { label: "미등록", value: "NONE" },
  { label: "전체", value: "ALL" },
];

const STATUS_BADGE: Record<SignReuploadStatus, { color: string; label: string }> = {
  MISSING: { color: "red", label: "재업로드 필요" },
  UPLOADED: { color: "green", label: "등록 완료" },
  NONE: { color: "gray", label: "미등록" },
};

// 엑셀에서 한글이 깨지지 않도록 CSV 앞에 붙이는 BOM
const BOM = String.fromCharCode(0xfeff);

const formatDateTime = (date: string | null) =>
  date ? dayjs(date).format(DATE_TIME_FORMAT_HYPHEN) : "-";

function StatCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value?: number;
  unit: string;
  color?: string;
}) {
  return (
    <Paper withBorder radius="md" p="md">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text fz={28} fw={700} c={color}>
        {value ?? "-"}
        <Text span size="md" fw={500} c="dimmed" ml={4}>
          {unit}
        </Text>
      </Text>
    </Paper>
  );
}

/** 현재 보이는 목록을 CSV(엑셀에서 열림)로 내려받는다. */
function downloadCsv(professors: AdminSignReuploadProfessor[]) {
  const header = ["아이디", "이름", "학과", "이메일", "심사 학생 수", "서명 상태", "서명 업로드"];
  const rows = professors.map((p) => [
    p.loginId,
    p.name,
    p.department ?? "",
    p.email ?? "",
    String(p.assignedStudentCount),
    STATUS_BADGE[p.status].label,
    formatDateTime(p.signUploadedAt),
  ]);
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((row) => row.map(escape).join(",")).join("\r\n");

  const blob = new Blob([`${BOM}${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `교수_서명_재업로드_현황_${dayjs().format(DATE_TIME_FORMAT_HYPHEN)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function SignReuploadStatusSection() {
  const {
    summary,
    data: professors,
    isLoading,
    isValidating,
    mutate,
  } = useAdminSignReuploadStatus();
  const [filter, setFilter] = useState<Filter>("MISSING");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState<string | null>(null);

  const departments = useMemo(
    () =>
      Array.from(
        new Set((professors ?? []).map((p) => p.department).filter((d): d is string => !!d))
      ).sort(),
    [professors]
  );

  const filtered = useMemo(() => {
    const keyword = search.trim();
    return (professors ?? []).filter((p) => {
      if (filter !== "ALL" && p.status !== filter) return false;
      if (department && p.department !== department) return false;
      if (keyword && !p.name.includes(keyword) && !p.loginId.includes(keyword)) return false;
      return true;
    });
  }, [professors, filter, search, department]);

  return (
    <Stack>
      <SimpleGrid cols={{ base: 2, md: 4 }}>
        <StatCard label="전체 교수" value={summary?.professorCount} unit="명" />
        <StatCard label="서명 재업로드 필요" value={summary?.missingCount} unit="명" color="red" />
        <StatCard label="서명 등록 완료" value={summary?.uploadedCount} unit="명" color="green" />
        <StatCard label="서명 미등록" value={summary?.noneCount} unit="명" />
      </SimpleGrid>

      <Group gap="sm">
        <SegmentedControl
          data={FILTER_OPTIONS}
          value={filter}
          onChange={(value) => setFilter(value as Filter)}
        />
        <Select
          w={200}
          placeholder="학과"
          data={departments}
          value={department}
          onChange={setDepartment}
          clearable
          searchable
        />
        <TextInput
          w={200}
          placeholder="이름 또는 아이디"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
        />
      </Group>

      <Group justify="space-between">
        <Text c="gray">{professors ? `총 ${filtered.length}명` : ""}</Text>
        <Group gap="xs">
          <Tooltip label="저장소 상태 다시 확인">
            <ActionIcon
              variant="outline"
              color="blue"
              size="lg"
              loading={isValidating}
              onClick={() => mutate()}
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
          <Button
            variant="outline"
            leftSection={<IconDownload size={16} />}
            disabled={filtered.length === 0}
            onClick={() => downloadCsv(filtered)}
          >
            현재 목록 다운로드
          </Button>
        </Group>
      </Group>

      {isLoading && <Skeleton h={300} />}

      {!isLoading && (
        <Table headers={SIGN_REUPLOAD_STATUS_TABLE_HEADERS} h={650}>
          {filtered.length === 0 && (
            <TableTr>
              <TableTd colSpan={SIGN_REUPLOAD_STATUS_TABLE_HEADERS.length}>
                <Text c="dimmed" ta="center" py="lg">
                  조건에 맞는 교수가 없습니다.
                </Text>
              </TableTd>
            </TableTr>
          )}
          {filtered.map((professor, index) => {
            const badge = STATUS_BADGE[professor.status];
            return (
              <Table.Row key={professor.professorId}>
                <Table.Data>{index + 1}</Table.Data>
                <Table.Data>{professor.loginId}</Table.Data>
                <Table.Data>{professor.name}</Table.Data>
                <Table.Data>{professor.department ?? "-"}</Table.Data>
                <Table.Data>{professor.email ?? "-"}</Table.Data>
                <Table.Data>{professor.assignedStudentCount}</Table.Data>
                <Table.Data>
                  <Badge
                    color={badge.color}
                    variant={professor.status === "NONE" ? "light" : "filled"}
                  >
                    {badge.label}
                  </Badge>
                </Table.Data>
                <Table.Data>{formatDateTime(professor.signUploadedAt)}</Table.Data>
              </Table.Row>
            );
          })}
        </Table>
      )}
    </Stack>
  );
}

export default SignReuploadStatusSection;
