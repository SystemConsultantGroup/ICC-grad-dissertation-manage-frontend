import { useEffect, useState } from "react";
import { Stack, TextInput, Group } from "@mantine/core";
import { API_ROUTES } from "@/api/apiRoute";
import { ClientAxios } from "@/api/ClientAxios";
import { RowGroup, BasicRow, TitleRow } from "@/components/common/rows";
import { ApiDownloadButton } from "@/components/common/Buttons";
import { ThesisInfo } from "@/api/_types/reviews";
import { File } from "@/api/_types/file";

interface Props {
  studentId: string | number;
  token?: boolean;
}

interface studentFile {
  name: string;
  file: File | null;
}

function ThesisInfoSection({ studentId, token }: Props) {
  const [thesisTitle, setThesisTitle] = useState<string>("");
  const [thesisFile, setThesisFile] = useState<studentFile>({ name: "", file: null });
  const [presentationFile, setPresentationFile] = useState<studentFile>({ name: "", file: null });

  useEffect(() => {
    const fetchThesisInfo = async () => {
      // 학생 논문 정보 조회
      try {
        if (studentId && token) {
          const response = await ClientAxios.get(API_ROUTES.student.getThesis(studentId), {
            params: { type: "now" },
          });
          const thesisDetail = response.data as ThesisInfo;
          setThesisTitle(thesisDetail.title);
          if (thesisDetail) {
            setThesisFile({ name: thesisDetail.thesisFile?.name, file: thesisDetail?.thesisFile });
            setPresentationFile({
              name: thesisDetail.presentationFile?.name,
              file: thesisDetail.presentationFile,
            });
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchThesisInfo();
  }, [studentId, token]);

  return (
    <Stack gap={0}>
      <TitleRow title="논문 정보" />
      <RowGroup>
        <BasicRow field="논문 제목">{thesisTitle}</BasicRow>
      </RowGroup>
      <RowGroup>
        <BasicRow field="논문 파일">
          <Group gap={10}>
            <TextInput value={thesisFile?.name} disabled />
            <ApiDownloadButton file={thesisFile.file} disabled={thesisFile.file === null} />
          </Group>
        </BasicRow>
      </RowGroup>
      <RowGroup>
        <BasicRow field="논문 발표 파일">
          <Group gap={10}>
            <TextInput value={presentationFile?.name} disabled />
            <ApiDownloadButton
              file={presentationFile.file}
              disabled={presentationFile.file === null}
            />
          </Group>
        </BasicRow>
      </RowGroup>
    </Stack>
  );
}

export default ThesisInfoSection;
