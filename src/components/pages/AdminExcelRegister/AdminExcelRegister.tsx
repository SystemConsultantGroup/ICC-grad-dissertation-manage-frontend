"use client";

import { useState } from "react";
import { handleDownloadFile } from "@/api/_utils/handleDownloadFile";
import { Stack, Button, Switch } from "@mantine/core";
import { API_ROUTES } from "@/api/apiRoute";
import { ClientAxios } from "@/api/ClientAxios";
import {
  TitleRow,
  NoticeRow,
  RowGroup,
  BasicRow,
  ButtonRow,
  FileUploadRow,
} from "@/components/common/rows";
import { showNotificationError, showNotificationSuccess } from "@/components/common/Notifications";

interface Props {
  isProf?: boolean;
}

function AdminExcelRegister({ isProf = false }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPhd, setIsPhd] = useState<boolean>(false);

  const handleExcelDownload = async () => {
    try {
      if (isProf) {
        const fileLink = API_ROUTES.file.excel.professor();
        handleDownloadFile({
          fileLink,
          fileName: "교수 일괄 업로드 양식.xlsx",
        });
      } else {
        const fileLink = API_ROUTES.file.excel.student();
        handleDownloadFile({
          fileLink,
          fileName: "학생 일괄 업로드 양식.xlsx",
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      showNotificationSuccess({ message: "양식 다운로드가 완료되었습니다." });
    }
  };

  const handleExcelUpload = async () => {
    try {
      setIsSubmitting(true);
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        if (isProf) {
          await ClientAxios({
            url: API_ROUTES.professor.excel.post(),
            method: "POST",
            data: formData,
          });
        } else if (isPhd) {
          await ClientAxios({
            url: API_ROUTES.student.excel.phd(),
            method: "POST",
            data: formData,
          });
        } else {
          await ClientAxios({
            url: API_ROUTES.student.excel.post(),
            method: "POST",
            data: formData,
          });
        }
        showNotificationSuccess({ message: "일괄 등록이 완료되었습니다." });
      } else {
        showNotificationError({ message: "업로드할 파일을 선택해주세요." });
      }
    } catch (error) {
      // clientAxios에서 오류 출력
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Stack gap={0}>
      <TitleRow
        title={isProf ? "교수 기본 정보" : "학생 기본 정보"}
        subString={
          <>
            <>* 이미 등록된 중복 아이디의 경우 데이터가 수정됩니다.</>
            <br />
            <>* 한 번에 많은 사용자를 업로드할 시 로딩 시간이 길어질 수 있습니다.</>
          </>
        }
      />
      <RowGroup>
        <NoticeRow
          text="첨부파일 우측 상단의 안내사항을 참고하시기 바랍니다."
          withBorderBottom={false}
        />
      </RowGroup>
      {!isProf && (
        <RowGroup>
          <NoticeRow
            text="박사과정 등록시 심사과정, 논문 제목, 지도교수 및 심사위원 정보를 제외하고 입력해주세요."
            withBorderBottom={false}
          />
        </RowGroup>
      )}
      {!isProf && (
        <RowGroup>
          <BasicRow field="박사 과정">
            <Switch
              checked={isPhd}
              onChange={(e) => {
                setIsPhd(e.currentTarget.checked);
              }}
            ></Switch>
          </BasicRow>
        </RowGroup>
      )}
      <RowGroup>
        <BasicRow field="엑셀 양식">
          <Button onClick={handleExcelDownload}>다운로드</Button>
        </BasicRow>
      </RowGroup>
      <RowGroup>
        <FileUploadRow field="엑셀 파일 선택" onChange={setFile} />
      </RowGroup>
      <RowGroup>
        <ButtonRow
          buttons={[
            <Button key="register" onClick={handleExcelUpload} loading={isSubmitting}>
              등록하기
            </Button>,
          ]}
        />
      </RowGroup>
    </Stack>
  );
}
export default AdminExcelRegister;
