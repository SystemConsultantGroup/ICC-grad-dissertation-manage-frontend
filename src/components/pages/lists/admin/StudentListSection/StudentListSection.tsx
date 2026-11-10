/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import useStudents from "@/api/SWR/useStudents";
import { PagedStudentsRequestQuery } from "@/api/_types/students";
import { getPageSizeStartEndNumber } from "@/api/_utils/getPageSizeStartEndNumber";
import { PAGE_SIZES } from "@/constants/pageSize";
import { useDebouncedState, useDisclosure } from "@mantine/hooks";
import { ChangeEvent, useEffect, useState } from "react";
import dayjs from "dayjs";
import { DATE_TIME_FORMAT_HYPHEN } from "@/constants/date";
import { objectToQueryString } from "@/api/_utils/objectToUrl";
import { API_ROUTES } from "@/api/apiRoute";
import { handleDownloadFile } from "@/api/_utils/handleDownloadFile";
import {
  ActionIcon,
  Button,
  Center,
  Group,
  Input,
  Modal,
  Popover,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { SectionHeader } from "@/components/common/SectionHeader";
import { IconAlertTriangle, IconDownload, IconPlus, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { Table } from "@/components/common/Table";
import { DepartmentSelect } from "@/components/common/selects/DepartmentSelect";
import Pagination from "@/components/common/Pagination";
import { useRouter } from "next/navigation";
import { ClientAxios } from "@/api/ClientAxios";
import { showNotificationError, showNotificationSuccess } from "@/components/common/Notifications";
import { logBulkDeletion } from "@/api/logBulkDeletion";
import { REFRESH_DEFAULT_PAGE_NUMBER } from "../../_constants/page";
import { STUDENTS_TABLE_HEADERS } from "../../_constants/table";
import { TChangeQueryArg } from "../../_types/common";

function StudentListSection() {
  const { push } = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [pageSize, setPageSize] = useState<string | null>(String(PAGE_SIZES[0]));
  const [pageNumber, setPageNumber] = useState(1);
  const pageSizeNumber = Number(pageSize);
  const [query, setQuery] = useDebouncedState<PagedStudentsRequestQuery>(
    {
      pageNumber,
      pageSize: pageSizeNumber,
    },
    500
  );
  const {
    data: students,
    isLoading,
    pageData,
  } = useStudents({ ...query, pageNumber, pageSize: pageSizeNumber });

  const { startNumber } = getPageSizeStartEndNumber({
    pageNumber,
    pageSize: Number(pageSize ?? 0),
    arrayLength: students?.length ?? 0,
  });

  const startIndex = pageData?.pageNumber
    ? (pageData.pageNumber - 1) * Number(pageData.pageSize) + 1
    : 0;
  const endIndex = students ? startIndex + students.length - 1 : 0;

  // Todo: 파일명 및 필터 저장 방식 논의
  const handleDownloadStudentExcel = (option: "all" | "filtered") => {
    const dateString = dayjs().format(DATE_TIME_FORMAT_HYPHEN);
    const queryString = objectToQueryString({ ...query });

    const isAll = option === "all";
    const urlSuffix = isAll ? "" : queryString;

    const fileLink = API_ROUTES.student.excel.get() + urlSuffix;

    handleDownloadFile({
      fileLink,
      fileName: `학생 일괄 다운로드 파일_${dateString}.xlsx`,
    });
  };

  const handleChangeFilter = <T,>({ name, value }: TChangeQueryArg<T>) => {
    // useDebuncedState 에서 update 함수 타입이 정의되어 있지 않아 타입에러 발생
    setQuery(((prev: any) => ({
      ...prev,
      [name]: value === "" ? undefined : value,
      pageNumber: REFRESH_DEFAULT_PAGE_NUMBER,
    })) as any);
    setPageNumber(REFRESH_DEFAULT_PAGE_NUMBER);
  };

  useEffect(() => {
    setPageNumber(REFRESH_DEFAULT_PAGE_NUMBER);
  }, [pageSize]);

  const [confirmDeleteText, setConfirmDeleteText] = useState({
    representative: "",
    target: "",
    confirm: "",
  });

  const confirmedDeleteText =
    confirmDeleteText.representative.length >= 3 &&
    confirmDeleteText.target.trim() === "전체학생 삭제" &&
    confirmDeleteText.confirm.trim() === "삭제하겠습니다";

  const handleDelete = async () => {
    try {
      await logBulkDeletion("students", confirmDeleteText.representative);
    } catch {
      showNotificationError({ message: "삭제 기록을 남기지 못했습니다. 다시 시도해 주세요." });
      return;
    }
    try {
      await ClientAxios.delete(API_ROUTES.student.delete());
      showNotificationSuccess({ message: "학생 일괄 삭제 완료" });
      close();
    } catch (error) {
      /* empty */
    }
  };

  return (
    <Stack>
      <Modal opened={opened} onClose={close} withCloseButton={false} centered radius="lg">
        <Stack gap={36} align="center" p="lg">
          <IconAlertTriangle color="red" />
          <Group align="center" justify="center">
            <Text fw={600}>
              주의! 시스템 상 전체 학생이 삭제됩니다. 학과, 학년, 진행 연도를 무관하고 전부
              삭제됩니다.
            </Text>
            <Text fw={600}>
              계속하시려면 다음 입력창에 담당자 이름, &lsquo;전체학생 삭제&rsquo;, &lsquo;삭제하겠습니다&rsquo;을
              작성해주십시오.
            </Text>
            <Input
              value={confirmDeleteText.representative}
              onChange={(e) =>
                setConfirmDeleteText((o) => ({ ...o, representative: e.target.value }))
              }
              placeholder="일반대학원 학위논문시스템학과 홍길동"
            />
            <Input
              value={confirmDeleteText.target}
              onChange={(e) => setConfirmDeleteText((o) => ({ ...o, target: e.target.value }))}
              placeholder="전체학생 삭제"
            />
            <Input
              value={confirmDeleteText.confirm}
              onChange={(e) => setConfirmDeleteText((o) => ({ ...o, confirm: e.target.value }))}
              placeholder="삭제하겠습니다"
            />
          </Group>
          <Group>
            <Button key="cancel" variant="outline" onClick={close}>
              취소
            </Button>
            <Button
              key="delete"
              color="red"
              disabled={!confirmedDeleteText}
              onClick={() => {
                if (!confirm("정말 삭제하시겠습니까?")) return;
                handleDelete();
              }}
            >
              전체 삭제
            </Button>
          </Group>
        </Stack>
      </Modal>
      <SectionHeader
        withPageSizeSelector
        pageSize={pageSize}
        setPageSize={setPageSize}
        withSearchBar={false}
        total={pageData ? pageData?.totalCount : 0}
        startIndex={startNumber}
        endIndex={endIndex}
      >
        <SectionHeader.Buttons>
          <Group>
            <Button size="xs" leftSection={<IconX />} bg="red" onClick={open}>
              학생 삭제
            </Button>
            <Button size="xs" leftSection={<IconPlus />} component={Link} href="student_register">
              학생 추가
            </Button>
            <Popover width={200} position="bottom" withArrow shadow="md">
              <Popover.Target>
                <ActionIcon variant="outline" color="blue">
                  <IconDownload size={16} />
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown>
                <Stack>
                  <Button
                    onClick={() => {
                      handleDownloadStudentExcel("all");
                    }}
                  >
                    전체 학생 엑셀 저장
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleDownloadStudentExcel("filtered");
                    }}
                  >
                    필터 학생 엑셀 저장
                  </Button>
                </Stack>
              </Popover.Dropdown>
            </Popover>
          </Group>
        </SectionHeader.Buttons>
      </SectionHeader>
      {isLoading && <Skeleton />}
      <Table headers={STUDENTS_TABLE_HEADERS} h={650}>
        {/* 필터 영역 */}
        <Table.FilterRow>
          <Table.Data>필터</Table.Data>
          <Table.Data>
            <Table.TextInput
              w={150}
              placeholder="아이디"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                handleChangeFilter<string>({ name: "studentNumber", value: event.target.value });
              }}
            />
          </Table.Data>
          <Table.Data>
            <Table.TextInput
              w={150}
              placeholder="이름"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                handleChangeFilter<string>({ name: "name", value: event.target.value });
              }}
            />
          </Table.Data>
          <Table.Data>
            <Table.TextInput
              w={150}
              placeholder="이메일"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                handleChangeFilter<string>({ name: "email", value: event.target.value });
              }}
            />
          </Table.Data>
          <Table.Data>
            <Table.TextInput
              w={150}
              placeholder="연락처"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                handleChangeFilter<string>({ name: "phone", value: event.target.value });
              }}
            />
          </Table.Data>
          <Table.Data>
            <DepartmentSelect
              w={150}
              placeholder="학과"
              onChange={(value) => {
                handleChangeFilter<string | null>({ name: "departmentId", value });
              }}
              allowDeselect
            />
          </Table.Data>
        </Table.FilterRow>
        {students?.map((student, index) => (
          <Table.Row
            key={student.id}
            onClick={() => {
              push(`students/${student.id}`);
            }}
          >
            <Table.Data>{index + 1 + (pageNumber - 1) * pageSizeNumber}</Table.Data>
            <Table.Data>{student.loginId}</Table.Data>
            <Table.Data>{student.name}</Table.Data>
            <Table.Data>{student.email}</Table.Data>
            <Table.Data>{student.phone}</Table.Data>
            <Table.Data>{student.department.name}</Table.Data>
          </Table.Row>
        ))}
      </Table>
      <Center>
        <Pagination
          value={pageNumber}
          onChange={setPageNumber}
          total={pageData ? pageData?.totalPages : 1}
        />
      </Center>
    </Stack>
  );
}

export default StudentListSection;
