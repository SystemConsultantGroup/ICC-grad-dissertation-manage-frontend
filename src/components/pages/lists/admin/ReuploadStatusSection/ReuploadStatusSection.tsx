"use client";

import { Fragment, useMemo, useState } from "react";
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
import {
  IconChevronDown,
  IconChevronRight,
  IconDownload,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";
import { Table } from "@/components/common/Table";
import { useAdminReuploadStatus } from "@/api/SWR";
import { STAGE_LOOKUP_TABLE } from "@/api/_types/common";
import { AdminReuploadStudent, ReuploadStatus, ReuploadTarget } from "@/api/_types/file";
import { DATE_TIME_FORMAT_HYPHEN } from "@/constants/date";
import { REUPLOAD_STATUS_TABLE_HEADERS } from "../../_constants/table";

type Filter = "PENDING" | "DONE" | "AFFECTED" | "ALL";

const FILTER_OPTIONS: { label: string; value: Filter }[] = [
  { label: "미완료", value: "PENDING" },
  { label: "완료", value: "DONE" },
  { label: "재업로드 대상 전체", value: "AFFECTED" },
  { label: "전체 학생", value: "ALL" },
];

const FILE_TYPE_LABEL: Record<ReuploadTarget["type"], string> = {
  THESIS: "논문 파일",
  PRESENTATION: "논문 발표 파일",
  REVISION_REPORT: "수정 사항 보고서",
};

const FILE_STATUS_BADGE: Record<ReuploadStatus, { color: string; label: string }> = {
  MISSING: { color: "red", label: "재업로드 필요" },
  REUPLOADED: { color: "green", label: "재업로드 완료" },
  OK: { color: "gray", label: "정상 보관" },
};

// 엑셀에서 한글이 깨지지 않도록 CSV 앞에 붙이는 BOM
const BOM = String.fromCharCode(0xfeff);

const isAffected = (student: AdminReuploadStudent) =>
  student.missingCount + student.reuploadedCount > 0;

const formatDateTime = (date: string | null) =>
  date ? dayjs(date).format(DATE_TIME_FORMAT_HYPHEN) : "-";

function studentStatusBadge(student: AdminReuploadStudent) {
  if (student.missingCount > 0) return <Badge color="red">미완료</Badge>;
  if (student.reuploadedCount > 0) return <Badge color="green">완료</Badge>;
  return (
    <Badge color="gray" variant="light">
      대상 아님
    </Badge>
  );
}

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
function downloadCsv(students: AdminReuploadStudent[]) {
  const header = [
    "학번",
    "이름",
    "학과",
    "남은 파일",
    "완료 파일",
    "상태",
    "최근 재업로드",
    "남은 파일 목록",
  ];
  const rows = students.map((s) => [
    s.loginId,
    s.name,
    s.department ?? "",
    String(s.missingCount),
    String(s.reuploadedCount),
    s.missingCount > 0 ? "미완료" : s.reuploadedCount > 0 ? "완료" : "대상 아님",
    formatDateTime(s.lastReuploadedAt),
    s.files
      .filter((f) => f.status === "MISSING")
      .map((f) => `${STAGE_LOOKUP_TABLE[f.stage]} ${FILE_TYPE_LABEL[f.type]}`)
      .join(" / "),
  ]);
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((row) => row.map(escape).join(",")).join("\r\n");

  const blob = new Blob([`${BOM}${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `재업로드_현황_${dayjs().format(DATE_TIME_FORMAT_HYPHEN)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function ReuploadStatusSection() {
  const { summary, data: students, isLoading, isValidating, mutate } = useAdminReuploadStatus();
  const [filter, setFilter] = useState<Filter>("PENDING");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const departments = useMemo(
    () =>
      Array.from(
        new Set((students ?? []).map((s) => s.department).filter((d): d is string => !!d))
      ).sort(),
    [students]
  );

  const filtered = useMemo(() => {
    const keyword = search.trim();
    return (students ?? []).filter((s) => {
      if (filter === "PENDING" && s.missingCount === 0) return false;
      if (filter === "DONE" && !(isAffected(s) && s.missingCount === 0)) return false;
      if (filter === "AFFECTED" && !isAffected(s)) return false;
      if (department && s.department !== department) return false;
      if (keyword && !s.name.includes(keyword) && !s.loginId.includes(keyword)) return false;
      return true;
    });
  }, [students, filter, search, department]);

  const pendingStudentCount =
    summary && summary.affectedStudentCount - summary.completedStudentCount;

  return (
    <Stack>
      <SimpleGrid cols={{ base: 2, md: 4 }}>
        <StatCard label="재업로드 대상 학생" value={summary?.affectedStudentCount} unit="명" />
        <StatCard
          label="재업로드 완료 학생"
          value={summary?.completedStudentCount}
          unit="명"
          color="green"
        />
        <StatCard label="미완료 학생" value={pendingStudentCount} unit="명" color="red" />
        <StatCard label="남은 파일" value={summary?.missingFileCount} unit="건" color="red" />
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
          placeholder="이름 또는 학번"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
        />
      </Group>

      <Group justify="space-between">
        <Text c="gray">{students ? `총 ${filtered.length}명` : ""}</Text>
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
        <Table headers={REUPLOAD_STATUS_TABLE_HEADERS} h={650}>
          {filtered.length === 0 && (
            <TableTr>
              <TableTd colSpan={REUPLOAD_STATUS_TABLE_HEADERS.length}>
                <Text c="dimmed" ta="center" py="lg">
                  조건에 맞는 학생이 없습니다.
                </Text>
              </TableTd>
            </TableTr>
          )}
          {filtered.map((student, index) => {
            const isOpen = expanded === student.studentId;
            return (
              <Fragment key={student.studentId}>
                <Table.Row onClick={() => setExpanded(isOpen ? null : student.studentId)}>
                  <Table.Data>
                    <Group gap={4} wrap="nowrap">
                      {isOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                      {index + 1}
                    </Group>
                  </Table.Data>
                  <Table.Data>{student.loginId}</Table.Data>
                  <Table.Data>{student.name}</Table.Data>
                  <Table.Data>{student.department ?? "-"}</Table.Data>
                  <Table.Data>
                    <Text c={student.missingCount > 0 ? "red" : undefined} fw={500}>
                      {student.missingCount}
                    </Text>
                  </Table.Data>
                  <Table.Data>{student.reuploadedCount}</Table.Data>
                  <Table.Data>{studentStatusBadge(student)}</Table.Data>
                  <Table.Data>{formatDateTime(student.lastReuploadedAt)}</Table.Data>
                </Table.Row>
                {isOpen && (
                  <TableTr bg="gray.0">
                    <TableTd colSpan={REUPLOAD_STATUS_TABLE_HEADERS.length} py="md" px="xl">
                      <Stack gap={8}>
                        {student.files.map((file) => {
                          const badge = FILE_STATUS_BADGE[file.status];
                          return (
                            <Group key={file.thesisFileId} gap="sm" wrap="nowrap">
                              <Badge color={badge.color} variant="light" w={100}>
                                {badge.label}
                              </Badge>
                              <Text size="sm" w={180}>
                                {STAGE_LOOKUP_TABLE[file.stage]} {FILE_TYPE_LABEL[file.type]}
                              </Text>
                              <Text size="sm" c="dimmed" style={{ flex: 1 }} truncate>
                                {file.fileName ?? "-"}
                              </Text>
                              {file.reuploadedAt && (
                                <Text size="sm" c="dimmed">
                                  재업로드 {formatDateTime(file.reuploadedAt)}
                                </Text>
                              )}
                            </Group>
                          );
                        })}
                      </Stack>
                    </TableTd>
                  </TableTr>
                )}
              </Fragment>
            );
          })}
        </Table>
      )}
    </Stack>
  );
}

export default ReuploadStatusSection;
