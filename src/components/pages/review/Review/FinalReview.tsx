"use client";

import { Button, Group, Stack, Text } from "@mantine/core";
import Link from "next/link";
import { UseFormReturnType } from "@mantine/form";
import { BasicRow, ButtonRow, RowGroup, TextAreaRow, TitleRow } from "@/components/common/rows";
import { Status } from "@/api/_types/common";
import { File as ApiFile } from "@/api/_types/file";
import { Dispatch, SetStateAction } from "react";
import { StatusButtons } from "./StatusButtons";

export interface FinalReviewProps {
  form: UseFormReturnType<{
    status: Status;
    comment: string;
    commentFile: File | null | undefined;
  }>;
  previousCommentFile: ApiFile | undefined;
  currentState: null | "pending" | "submitted";
  commentType?: string;
  setCommentType: Dispatch<SetStateAction<string>>;
}

export function FinalReview({ form, currentState, commentType }: FinalReviewProps) {
  const { status } = form.values;

  return (
    <Stack gap={0}>
      <TitleRow title="최종 심사하기" />
      <RowGroup>
        <BasicRow field="합격 여부">
          <StatusButtons
            options={{ pending: true }}
            value={status}
            setValue={(newValue) => form.setFieldValue("status", newValue)}
          >
            {form?.errors?.thesis ? (
              <Text c="red" size="sm" ml={24}>
                {form.errors.thesis}
              </Text>
            ) : null}
          </StatusButtons>
        </BasicRow>
      </RowGroup>
      {/* <CommentTypeRow commentType={commentType} setCommentType={setCommentType} /> */}
      <TextAreaRow
        field="종합 의견"
        form={form}
        formKey="comment"
        disabled={commentType !== "심사 의견"}
      />
      {/* <RowGroup>
        <FileUploadRow
          field="심사 의견 파일"
          form={form}
          previousFile={previousCommentFile}
          formKey="commentFile"
          disabled={commentType !== "심사 의견 파일"}
        />
      </RowGroup> */}
      <Group justify="right" align="center" p={12}>
        <Text fz={14} c="gray">
          임시저장 시 합격여부는 자동으로 보류로 선택됩니다.
        </Text>
      </Group>
      <RowGroup withBorderBottom={false}>
        <ButtonRow
          buttons={[
            <Button
              key="temp_save"
              onClick={() => {
                form.setValues({ status: "PENDING" });
              }}
              color="violet"
              type="submit"
              loading={currentState === "pending"}
              disabled={currentState === "submitted"}
            >
              임시저장
            </Button>,
            <Button
              key="save"
              color="blue"
              type="submit"
              loading={currentState === "pending"}
              disabled={currentState === "submitted"}
            >
              최종저장
            </Button>,
            <Button key="back" variant="outline" component={Link} href="../final">
              목록으로
            </Button>,
          ]}
        />
      </RowGroup>
    </Stack>
  );
}
