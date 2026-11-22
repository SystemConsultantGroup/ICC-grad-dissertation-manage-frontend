/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { getPageSizeStartEndNumber } from "@/api/_utils/getPageSizeStartEndNumber";
import { handleDownloadFile } from "@/api/_utils/handleDownloadFile";
import { objectToQueryString } from "@/api/_utils/objectToUrl";
import { API_ROUTES } from "@/api/apiRoute";
import dayjs from "dayjs";
import { PAGE_SIZES } from "@/constants/pageSize";
import { useDebouncedState } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { ActionIcon, Button, Center, Group, Popover, Select, Skeleton, Stack } from "@mantine/core";
import { SectionHeader } from "@/components/common/SectionHeader";
import { IconDownload } from "@tabler/icons-react";
import { Table } from "@/components/common/Table";
import Pagination from "@/components/common/Pagination";
import { DepartmentSelect } from "@/components/common/selects/DepartmentSelect";
import { DATE_TIME_FORMAT_HYPHEN } from "@/constants/date";
import { PagedReviewsRequestQuery } from "@/api/_types/reviews";
import { useAdminReviewResult } from "@/api/SWR";
import { PAGE_NUMBER_GET_ALL, PAGE_SIZE_GET_ALL } from "@/constants/pagination";
import { STAGE_LOOKUP_TABLE } from "@/api/_types/common";
import { REFRESH_DEFAULT_PAGE_NUMBER } from "../../_constants/page";
import { TChangeQueryArg } from "../../_types/common";
import { REVIEW_RESULT_TABLE_HEADERS } from "../../_constants/table";

function ReviewResultListSection() {
  const { push } = useRouter();
  const [pageSize, setPageSize] = useState<string | null>(String(PAGE_SIZES[0]));
  const [pageNumber, setPageNumber] = useState(1);
  const pageSizeNumber = Number(pageSize);
  const [query, setQuery] = useDebouncedState<PagedReviewsRequestQuery>(
    {
      pageNumber,
      pageSize: pageSizeNumber,
    },
    500
  );
  const {
    data: reviewResults,
    isLoading,
    pageData,
  } = useAdminReviewResult({ ...query, pageNumber, pageSize: pageSizeNumber }, true);

  const { startNumber } = getPageSizeStartEndNumber({
    pageNumber,
    pageSize: Number(pageSize ?? 0),
    arrayLength: reviewResults?.length ?? 0,
  });

  const startIndex = pageData?.pageNumber
    ? (pageData.pageNumber - 1) * Number(pageData.pageSize) + 1
    : 0;
  const endIndex = reviewResults ? startIndex + reviewResults.length - 1 : 0;

  // Todo: 심사보고서 출력 방식 논의
  const handleDownloadReports = (option: "all" | "filtered") => {
    const dateString = dayjs().format(DATE_TIME_FORMAT_HYPHEN);
    const sizeAll = `?pageNumber=${PAGE_NUMBER_GET_ALL}&pageSize=${PAGE_SIZE_GET_ALL}`;
    const queryString = objectToQueryString({
      ...query,
      pageSize: PAGE_SIZE_GET_ALL,
      pageNumber: PAGE_NUMBER_GET_ALL,
    });

    const isAll = option === "all";
    const urlSuffix = isAll ? sizeAll : queryString;
    const fileLink = API_ROUTES.review.result.report() + urlSuffix;

    handleDownloadFile({
      fileLink,
      fileName: `결과보고서 일괄 다운로드 파일_${dateString}.zip`,
    });
  };

  const handleDownloadReviewResults = (option: "all" | "filtered") => {
    const dateString = dayjs().format(DATE_TIME_FORMAT_HYPHEN);
    const sizeAll = `?pageNumber=${PAGE_NUMBER_GET_ALL}&pageSize=${PAGE_SIZE_GET_ALL}`;
    const queryString = objectToQueryString({
      ...query,
      pageSize: PAGE_SIZE_GET_ALL,
      pageNumber: PAGE_NUMBER_GET_ALL,
    });

    const isAll = option === "all";
    const urlSuffix = isAll ? sizeAll : queryString;
    const fileLink = API_ROUTES.review.result.excel() + urlSuffix;

    handleDownloadFile({
      fileLink,
      fileName: `심사 목록 일괄 다운로드 파일_${dateString}.xlsx`,
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
      >
        <SectionHeader.Buttons>
          <Group>
            <Popover width={220} position="bottom" withArrow shadow="md">
              <Popover.Target>
                <ActionIcon variant="outline" color="blue">
                  <IconDownload size={16} />
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown>
                <Stack>
                  <Button
                    onClick={() => {
                      handleDownloadReviewResults("all");
                    }}
                  >
                    심사 목록 전체 출력
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleDownloadReviewResults("filtered");
                    }}
                  >
                    심사 목록 필터 출력
                  </Button>
                  <Button
                    onClick={() => {
                      handleDownloadReports("all");
                    }}
                  >
                    심사보고서 전체 다운로드
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleDownloadReports("filtered");
                    }}
                  >
                    심사보고서 필터 다운로드
                  </Button>
                </Stack>
              </Popover.Dropdown>
            </Popover>
          </Group>
        </SectionHeader.Buttons>
      </SectionHeader>
      {isLoading && <Skeleton />}
      <Table headers={REVIEW_RESULT_TABLE_HEADERS} h={650}>
        {/* 필터 영역 */}
        <Table.FilterRow>
          <Table.Data>필터</Table.Data>
          <Table.Data>
            <Select
              w="100%"
              miw={80}
              placeholder="구분"
              onChange={(value) => {
                handleChangeFilter<string | null>({ name: "stage", value });
              }}
              allowDeselect
              data={[
                { label: "예심", value: "PRELIMINARY" },
                { label: "본심", value: "MAIN" },
                // { label: "수정 단계", value: "REVISION" },
              ]}
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
              miw={300}
              placeholder="논문 제목"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                handleChangeFilter<string>({ name: "title", value: event.target.value });
              }}
            />
          </Table.Data>
          <Table.Data>
            <Select
              w="100%"
              miw={80}
              placeholder="결과"
              onChange={(value) => {
                handleChangeFilter<string | null>({ name: "summary", value });
              }}
              data={[
                { label: "합격", value: "PASS" },
                { label: "불합격", value: "FAIL" },
              ]}
              allowDeselect
            />
          </Table.Data>
        </Table.FilterRow>
        {reviewResults?.map((reviewResult, index) => (
          <Table.Row
            key={reviewResult.id}
            onClick={() => {
              push(`results/${reviewResult.id}`);
            }}
          >
            <Table.Data>{index + 1 + (pageNumber - 1) * pageSizeNumber}</Table.Data>
            <Table.Data>{STAGE_LOOKUP_TABLE[reviewResult.stage]}</Table.Data>
            <Table.Data>{reviewResult.student}</Table.Data>
            <Table.Data>{reviewResult.department}</Table.Data>
            <Table.Data>{reviewResult.title}</Table.Data>
            <Table.Data>
              {reviewResult.stage === "REVISION"
                ? reviewResult.summary === "PASS"
                  ? "확인 완료"
                  : "미확인"
                : reviewResult.summary === "PASS"
                  ? "합격"
                  : "불합격"}
            </Table.Data>
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

export default ReviewResultListSection;
