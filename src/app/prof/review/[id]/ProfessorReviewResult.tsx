import Link from "next/link";
import { Badge, Button, Stack } from "@mantine/core";
import {
  ApiFileRow,
  BasicRow,
  ButtonRow,
  LongContentRow,
  RowGroup,
  TitleRow,
} from "@/components/common/rows";
import { Status } from "@/api/_types/common";
import type { ProfessorReviewProps } from "./ProfessorReviewForm";

function textForStatus(status: Status) {
  switch (status) {
    case "PASS":
      return "합격";
    case "FAIL":
      return "불합격";
    case "PENDING":
      return "보류";
    default:
      return "알 수 없음";
  }
}

export function ProfessorReviewResult({ previous }: Pick<ProfessorReviewProps, "previous">) {
  return (
    <Stack gap={0}>
      <TitleRow title="내 심사 내역" badge={<Badge>최종저장 완료</Badge>} />
      <RowGroup>
        <BasicRow field="내용심사 합격 여부">
          <BasicRow.Text>
            <b>{textForStatus(previous.contentStatus)}</b>
          </BasicRow.Text>
        </BasicRow>
      </RowGroup>
      <RowGroup>
        <BasicRow field="구두심사 합격 여부">
          <BasicRow.Text>
            <b>{textForStatus(previous.presentationStatus)}</b>
          </BasicRow.Text>
        </BasicRow>
      </RowGroup>
      <LongContentRow field="심사 의견" content={previous.comment!} />
      <RowGroup>
        <ApiFileRow field="심사 의견 파일" file={previous.reviewFile} />
      </RowGroup>
      <RowGroup withBorderBottom={false}>
        <ButtonRow
          buttons={[
            <Button key="back" variant="outline" component={Link} href="../review">
              목록으로
            </Button>,
          ]}
        />
      </RowGroup>
    </Stack>
  );
}
