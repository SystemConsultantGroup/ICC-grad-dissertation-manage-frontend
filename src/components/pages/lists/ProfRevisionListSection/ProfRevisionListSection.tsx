/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import Pagination from "@/components/common/Pagination";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Center, Select, Skeleton, Stack } from "@mantine/core";
import { useRouter } from "next/navigation";
import { Table } from "@/components/common/Table";
import { DepartmentSelect } from "@/components/common/selects/DepartmentSelect";
import { ChangeEvent, useEffect, useState } from "react";
import { PAGE_SIZES } from "@/constants/pageSize";
import useRevisions from "@/api/SWR/useRevisions";
import { useDebouncedState } from "@mantine/hooks";
import { PagedRevisionRequestQuery } from "@/api/_types/reviews";
import { getPageSizeStartEndNumber } from "@/api/_utils/getPageSizeStartEndNumber";
import { PROF_REVISION_TABLE_HEADERS } from "../_constants/table";
import { TChangeQueryArg } from "../_types/common";
import { REFRESH_DEFAULT_PAGE_NUMBER } from "../_constants/page";

function ProfRevisionListSection() {
  const { push } = useRouter();
  const [pageSize, setPageSize] = useState<string | null>(String(PAGE_SIZES[0]));
  const [pageNumber, setPageNumber] = useState(1);
  const pageSizeNumber = Number(pageSize);
  const [query, setQuery] = useDebouncedState<PagedRevisionRequestQuery>(
    {
      pageNumber,
      pageSize: pageSizeNumber,
    },
    500
  );
  const {
    data: revisions,
    isLoading,
    pageData,
  } = useRevisions({ ...query, pageNumber, pageSize: pageSizeNumber });

  const { startNumber } = getPageSizeStartEndNumber({
    pageNumber,
    pageSize: Number(pageSize ?? 0),
    arrayLength: revisions?.length ?? 0,
  });
  const startIndex = pageData?.pageNumber
    ? (pageData.pageNumber - 1) * Number(pageData.pageSize) + 1
    : 0;
  const endIndex = revisions ? startIndex + revisions.length - 1 : 0;

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

  return (
    <Stack>
      <SectionHeader
        withPageSizeSelector
        pageSize={pageSize}
        setPageSize={setPageSize}
        withSearchBar={false}
        total={pageData ? pageData?.totalCount : 0}
        startIndex={startNumber}
        endIndex={endIndex}
      ></SectionHeader>
      {isLoading && <Skeleton />}
      <Table headers={PROF_REVISION_TABLE_HEADERS} h={650}>
        {/* 필터 영역 */}
        <Table.FilterRow>
          <Table.Data>필터</Table.Data>
          <Table.Data>
            <DepartmentSelect
              w="100%"
              miw={150}
              placeholder="학과"
              onChange={(value) => {
                handleChangeFilter<string | null>({ name: "department", value });
              }}
              allowDeselect
            />
          </Table.Data>
          <Table.Data>
            <Table.TextInput
              w="100%"
              miw={80}
              placeholder="저자"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                handleChangeFilter<string>({ name: "author", value: event.target.value });
              }}
            />
          </Table.Data>
          <Table.Data>
            <Table.TextInput
              w="100%"
              miw={300}
              placeholder="논문 제목"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                handleChangeFilter<string>({ name: "title", value: event.target.value });
              }}
            />
          </Table.Data>
          <Table.Data>
            <Select
              w={100}
              placeholder="확인 여부"
              onChange={(value) => {
                handleChangeFilter<string | null>({ name: "contentStatus", value });
              }}
              data={[
                { label: "미확인", value: "UNEXAMINED" },
                { label: "확인 완료", value: "PASS" },
              ]}
              allowDeselect
            />
          </Table.Data>
        </Table.FilterRow>
        {revisions?.map((revision, index) => (
          <Table.Row
            key={revision.id}
            onClick={() => {
              push(`revision/${revision.id}`);
            }}
          >
            <Table.Data>{index + 1 + (pageNumber - 1) * pageSizeNumber}</Table.Data>
            <Table.Data>{revision.department}</Table.Data>
            <Table.Data>{revision.student}</Table.Data>
            <Table.Data>{revision.title}</Table.Data>
            <Table.Data>{revision.status === "UNEXAMINED" ? "미확인" : "확인 완료"}</Table.Data>
          </Table.Row>
        ))}
      </Table>
      <Center>
        <Pagination total={1} />
      </Center>
    </Stack>
  );
}

export default ProfRevisionListSection;
