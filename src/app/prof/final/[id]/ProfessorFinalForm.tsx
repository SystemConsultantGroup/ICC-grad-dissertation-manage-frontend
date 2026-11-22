"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import { ClientAxios } from "@/api/ClientAxios";
import { Status } from "@/api/_types/common";
import { File as ApiFile } from "@/api/_types/file";
import { UpdateReviewRequestBody } from "@/api/_types/reviews";
import { API_ROUTES } from "@/api/apiRoute";
import { showNotificationError, showNotificationSuccess } from "@/components/common/Notifications";
import { FinalReview } from "@/components/pages/review/Review";
import { ReviewConfirmModal } from "@/components/pages/review/ReviewConfirmModal";
import { ThesisInfoData } from "@/components/pages/review/ThesisInfo/ThesisInfo";
import { useRouter } from "next/navigation";
import { transactionTask } from "@/api/_utils/task";
import { uploadFile } from "@/api/_utils/uploadFile";

export interface ProfessorFinalProps {
  reviewId: string;
  thesisInfo: ThesisInfoData;
  previous: {
    status: Status;
    comment: string | null;
    reviewFile: ApiFile | null;
  };
  within: boolean;
}

interface FormInput {
  status: Status;
  comment: string;
  commentFile: File | undefined | null;
}

export function ProfessorFinalForm({
  reviewId,
  thesisInfo,
  previous,
  within,
}: ProfessorFinalProps) {
  const router = useRouter();
  const form = useForm<FormInput>({
    initialValues: {
      status: previous.status,
      comment: previous.comment ?? "",
      commentFile: undefined,
    },
    validate: {
      status: (value) =>
        value && value !== "UNEXAMINED" ? null : "합격, 불합격, 보류 중 하나를 선택해주세요.",
    },
  });
  const { values } = form;
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentState, setCurrentState] = useState<null | "pending" | "submitted">(null);
  const [commentType, setCommentType] = useState<string>("심사 의견");

  const handleSubmit = transactionTask(async (task, input: FormInput) => {
    setCurrentState("pending");
    task.onComplete(() => setCurrentState("submitted"));

    const isPending = input.status === "PENDING";
    let fileUUID;
    if (input.commentFile) {
      fileUUID = (await uploadFile(input.commentFile)).uuid;
    } else if (input.commentFile !== null) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      fileUUID = previous.reviewFile?.uuid ?? undefined;
    }

    await ClientAxios.put(
      API_ROUTES.review.final.put(reviewId),
      {
        contentStatus: input.status,
        ...(commentType === "심사 의견" ? { comment: input.comment } : {}),
        // ...(commentType === "심사 의견 파일" ? { fileUUID } : {}),
      } satisfies UpdateReviewRequestBody,
      { baseURL: process.env.NEXT_PUBLIC_REVIEW_API_ENDPOINT }
    );

    if (previous.reviewFile && input.commentFile !== undefined) {
      await ClientAxios.delete(API_ROUTES.file.delete(previous.reviewFile.uuid));
    }

    showNotificationSuccess({
      message: `${thesisInfo.studentInfo.name} 학생의 논문 심사결과를 ${
        isPending ? "임시저장" : "저장"
      }했습니다.`,
    });

    router.push("/prof/final");
    router.refresh();
  });

  return (
    <form
      onSubmit={form.onSubmit((input) => {
        if (!within) {
          showNotificationError({ message: "최종 심사 기간이 아닙니다." });
        } else if (input.status === "PENDING") {
          handleSubmit(input);
        } else {
          const hasCommentFile = previous.reviewFile
            ? values.commentFile !== null
            : !!values.commentFile;
          if (!values.comment && !hasCommentFile) {
            // showNotificationError({ message: "심사 의견이나 심사 의견 파일을 첨부해주세요." });
            showNotificationError({ message: "종합 의견을 작성해주세요." });
            return;
          }
          setShowConfirmDialog(true);
        }
      })}
    >
      <FinalReview
        form={form}
        previousCommentFile={previous.reviewFile ?? undefined}
        currentState={currentState}
        commentType={commentType}
        setCommentType={setCommentType}
      />
      <ReviewConfirmModal
        thesis={thesisInfo}
        review={{
          thesis: values.status,
          presentation: null,
          comment: values.comment,
          commentFile: values.commentFile?.name ?? null,
        }}
        opened={showConfirmDialog}
        onConfirm={() => handleSubmit(values)}
        onClose={() => {
          setShowConfirmDialog(false);
        }}
        isFinal
      />
    </form>
  );
}
