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
import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Group,
  Popover,
  Select,
  Skeleton,
  Stack,
} from "@mantine/core";
import { SectionHeader } from "@/components/common/SectionHeader";
import { IconDownload } from "@tabler/icons-react";
import { Table } from "@/components/common/Table";
import Pagination from "@/components/common/Pagination";
import { PagedProfReviewsRequestQuery } from "@/api/_types/reviews";
import useReviews from "@/api/SWR/useReviews";
import { DATE_TIME_FORMAT_HYPHEN } from "@/constants/date";
import { DepartmentSelect } from "@/components/common/selects/DepartmentSelect";
import { PAGE_NUMBER_GET_ALL, PAGE_SIZE_GET_ALL } from "@/constants/pagination";
import { STAGE_LOOKUP_TABLE } from "@/api/_types/common";
import { fetcher } from "@/api/fetcher";
import { PhasesResponse } from "@/api/_types/phase";
import { useAuth } from "@/components/common/AuthProvider";
import { REFRESH_DEFAULT_PAGE_NUMBER } from "../_constants/page";
import { TChangeQueryArg } from "../_types/common";
import { PROF_REVIEW_TABLE_HEADERS } from "../_constants/table";

interface Props {
  isFinal: boolean;
}

function ProfReviewListSection({ isFinal }: Props) {
  const { token } = useAuth();
  const { push } = useRouter();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [dateLoading, setDateLoading] = useState(false);

  const [pageSize, setPageSize] = useState<string | null>(String(PAGE_SIZES[0]));
  const [pageNumber, setPageNumber] = useState(1);
  const pageSizeNumber = Number(pageSize);

  const [query, setQuery] = useDebouncedState<PagedProfReviewsRequestQuery>(
    {
      pageNumber,
      pageSize: pageSizeNumber,
    },
    500
  );
  const {
    data: reviews,
    isLoading,
    pageData,
  } = useReviews(
    { startDate, endDate, ...query, pageNumber, pageSize: pageSizeNumber },
    isFinal,
    dateLoading
  );

  const { startNumber } = getPageSizeStartEndNumber({
    pageNumber,
    pageSize: Number(pageSize ?? 0),
    arrayLength: reviews?.length ?? 0,
  });

  const startIndex = pageData?.pageNumber
    ? (pageData.pageNumber - 1) * Number(pageData.pageSize) + 1
    : 0;
  const endIndex = reviews ? startIndex + reviews.length - 1 : 0;

  // Todo: 파일명 및 필터 저장 방식 논의
  const handleDownloadReviewExcel = (option: "all" | "filtered") => {
    const dateString = dayjs().format(DATE_TIME_FORMAT_HYPHEN);
    const sizeAll = `?pageNumber=${PAGE_NUMBER_GET_ALL}&pageSize=${PAGE_SIZE_GET_ALL}`;
    const queryString = objectToQueryString({
      ...query,
      pageSize: PAGE_SIZE_GET_ALL,
      pageNumber: PAGE_NUMBER_GET_ALL,
      startDate: query.startDate ? query.startDate.toISOString() : undefined,
      endDate: query.endDate ? query.endDate.toISOString() : undefined,
    });

    const isAll = option === "all";
    const urlSuffix = isAll ? sizeAll : queryString;

    const fileLink = isFinal
      ? API_ROUTES.review.final.excel() + urlSuffix
      : API_ROUTES.review.excel() + urlSuffix;

    handleDownloadFile({
      fileLink,
      fileName: `심사 대상 일괄 다운로드 파일_${dateString}.xlsx`,
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

  useEffect(() => {
    const fetchDate = async () => {
      setDateLoading(false);
      const data = (await fetcher({ url: API_ROUTES.phase.get(), token })) as PhasesResponse;
      const thesisPhase = data.phases.find((phase) => phase.title.includes("금학기 기간 설정"));

      setStartDate(thesisPhase?.start ? new Date(thesisPhase.start) : null);
      setEndDate(thesisPhase?.end ? new Date(thesisPhase.end) : null);
      setDateLoading(true);
    };
    if (token) {
      fetchDate();
    }
  }, [token]);

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
                      handleDownloadReviewExcel("all");
                    }}
                  >
                    심사 목록 전체 출력
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleDownloadReviewExcel("filtered");
                    }}
                  >
                    심사 목록 필터 출력
                  </Button>
                </Stack>
              </Popover.Dropdown>
            </Popover>
          </Group>
        </SectionHeader.Buttons>
      </SectionHeader>
      {isLoading && <Skeleton />}
      <Table headers={PROF_REVIEW_TABLE_HEADERS} h={650}>
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
          <Table.Data>-</Table.Data>
          <Table.Data>
            <Select
              w="100%"
              miw={80}
              placeholder="현황"
              onChange={(value) => {
                handleChangeFilter<string | null>({ name: "status", value });
              }}
              data={[
                { label: "진행중", value: "PENDING" },
                { label: "심사 완료", value: "COMPLETE" },
              ]}
              allowDeselect
            />
          </Table.Data>
        </Table.FilterRow>
        {reviews?.map((review, index) => (
          <Table.Row
            key={review.id}
            onClick={() => {
              push(isFinal ? `final/${review.id}` : `review/${review.id}`);
            }}
          >
            <Table.Data>{index + 1 + (pageNumber - 1) * pageSizeNumber}</Table.Data>
            <Table.Data>{STAGE_LOOKUP_TABLE[review.stage]}</Table.Data>
            <Table.Data>{review.student}</Table.Data>
            <Table.Data>{review.department}</Table.Data>
            <Table.Data>{review.title}</Table.Data>
            <Table.Data>
              {review.reviewerRole === "COMMITTEE_CHAIR" ? (
                <Badge>심사위원장</Badge>
              ) : review.reviewerRole === "COMMITTEE_MEMBER" ? (
                <Badge>심사위원</Badge>
              ) : review.reviewerRole === "ADVISOR" ? (
                <Badge>지도교수</Badge>
              ) : (
                <></>
              )}
            </Table.Data>
            <Table.Data>{review.status === "PENDING" ? "진행중" : "심사 완료"}</Table.Data>
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

export default ProfReviewListSection;
