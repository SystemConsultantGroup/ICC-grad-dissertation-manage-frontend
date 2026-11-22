"use client";

import {
  BasicRow,
  FileUploadRow,
  LongContentRow,
  RowGroup,
  TitleRow,
} from "@/components/common/rows";
import { Button, Stack } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { useAuth } from "@/components/common/AuthProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import classes from "@/components/pages/revision/RevisionSubmissionForm/RevisionSubmissionForm.module.css";
import useThesis from "@/api/SWR/useThesis";
import { uploadFile } from "@/api/_utils/uploadFile";
import { ClientAxios } from "@/api/ClientAxios";
import { API_ROUTES } from "@/api/apiRoute";
import { transaction } from "@/api/_utils/task";
import { showNotificationSuccess } from "@/components/common/Notifications";

interface RevisionSubmissionFormInputs {
  thesisFile?: File | null;
  revisionReportFile?: File | null;
}

function RevisionSubmissionForm() {
  const { user } = useAuth();
  const { data: main } = useThesis(user?.id || 0, { type: "main" }, !!user);
  const { data: thesis, isLoading } = useThesis(user?.id || 0, { type: "revision" }, !!user);
  const form = useForm<RevisionSubmissionFormInputs>({
    initialValues: {
      thesisFile: null,
      revisionReportFile: null,
    },
    validate: {
      thesisFile: thesis?.thesisFile
        ? (value) => (value === null ? "수정 논문 파일을 첨부해주세요." : undefined)
        : isNotEmpty("수정 논문 파일을 첨부해주세요."),
      revisionReportFile: thesis?.revisionReportFile
        ? (value) => (value === null ? "수정지시사항 결과보고서 파일을 첨부해주세요." : undefined)
        : isNotEmpty("수정지시사항 결과보고서 파일을 첨부해주세요."),
    },
  });
  const { onSubmit } = form;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (values: RevisionSubmissionFormInputs) => {
    setIsSubmitting(true);
    try {
      await transaction(async () => {
        const thesisFileUUID = values.thesisFile
          ? (await uploadFile(values.thesisFile!)).uuid
          : undefined;
        const revisionReportFileUUID = values.revisionReportFile
          ? (await uploadFile(values.revisionReportFile!)).uuid
          : undefined;
        await ClientAxios.put(API_ROUTES.student.putThesis(user!.id), {
          thesisFileUUID,
          revisionReportFileUUID,
        });
      });
      showNotificationSuccess({
        title: "수정사항 제출 완료",
        message: "수정사항이 제출되었습니다.",
      });
      router.push("/student/revision/success");
    } catch (error) {
      // TODO: Notification & 에러 처리
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      form.setValues({
        thesisFile: thesis?.thesisFile ? undefined : null,
        revisionReportFile: thesis?.revisionReportFile ? undefined : null,
      });
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form onSubmit={onSubmit(handleSubmit)}>
      <Stack gap={0}>
        <TitleRow title="수정사항 제출" />
        <RowGroup>
          <BasicRow field="저자">
            <BasicRow.Text>{user?.name}</BasicRow.Text>
          </BasicRow>
        </RowGroup>
        <RowGroup>
          <BasicRow field="논문 제목">
            <BasicRow.Text>{main ? main.title : "..."}</BasicRow.Text>
          </BasicRow>
        </RowGroup>
        <LongContentRow field="논문 초록" content={main ? main.abstract : "..."} />
        <RowGroup>
          <FileUploadRow
            field="수정 논문 파일"
            form={form}
            formKey="thesisFile"
            fieldSize={180}
            previousFile={thesis?.thesisFile}
          />
        </RowGroup>
        <RowGroup>
          <FileUploadRow
            field="수정지시사항 결과보고서"
            form={form}
            formKey="revisionReportFile"
            fieldSize={180}
            previousFile={thesis?.revisionReportFile}
          />
        </RowGroup>
        <Button type="submit" className={classes.submitButton} loading={isSubmitting}>
          수정사항 제출
        </Button>
      </Stack>
    </form>
  );
}

export default RevisionSubmissionForm;
