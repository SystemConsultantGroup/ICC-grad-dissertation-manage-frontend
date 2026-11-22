import { BasicRow, RowGroup } from "@/components/common/rows";
import { DATE_FORMAT } from "@/constants/date";
import { Button, Group, InputBase, Modal, NumberInput, Select, Stack, Text } from "@mantine/core";
import { IMaskInput } from "react-imask";
import { DateInput } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";
import {
  ACHIEVEMENT_AUTHOR_TYPE_LOOKUP_TABLE,
  ACHIEVEMENT_TYPE_LOOKUP_TABLE,
  AchievementAuthorType,
  AchievementType,
} from "@/api/_types/achievement";
import { UseFormReturnType } from "@mantine/form";
import { ClientAxios } from "@/api/ClientAxios";
import { API_ROUTES } from "@/api/apiRoute";
import { showNotificationSuccess } from "@/components/common/Notifications";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export interface AchievementFormInput {
  performance: AchievementType;
  journalName: string;
  paperTitle: string;
  ISSN1?: string;
  ISSN2?: string;
  publicationDate: Date;
  authorType: AchievementAuthorType;
  authorNumbers: number;
}

interface Props {
  form: UseFormReturnType<AchievementFormInput>;
  handleSubmit: (input: AchievementFormInput) => void;
  isEdit?: boolean;
  isAdmin?: boolean;
}

function AchievementForm({ form, handleSubmit, isEdit, isAdmin }: Props) {
  const { onSubmit, getInputProps } = form;
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { id } = useParams();

  const transformedAchievementTypeList = Object.entries(ACHIEVEMENT_TYPE_LOOKUP_TABLE).map(
    ([key, value]) => ({ value: key, label: value })
  );
  const transformedAuthorTypeList = Object.entries(ACHIEVEMENT_AUTHOR_TYPE_LOOKUP_TABLE).map(
    ([key, value]) => ({ value: key, label: value })
  );

  const handleDelete = async () => {
    try {
      await ClientAxios.delete(API_ROUTES.achievement.delete(id as string));
      router.push(`/student/achievement/`);
      showNotificationSuccess({ message: "실적 정보가 삭제되었습니다." });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Modal
        opened={isDeleting}
        onClose={() => setIsDeleting(false)}
        title="논문 실적 삭제 확인"
        centered
      >
        <Stack align="center">
          <Text fw={700}>
            {"<"}
            {form.values.paperTitle}
            {">을 실적에서 삭제하시겠습니까?"}
          </Text>
          <Group>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              취소
            </Button>
            <Button color="red" onClick={handleDelete}>
              확인
            </Button>
          </Group>
        </Stack>
      </Modal>
      <form onSubmit={onSubmit(handleSubmit)}>
        <Stack gap={0}>
          <RowGroup>
            <BasicRow field="논문 실적 구분">
              <Select
                w={400}
                allowDeselect={false}
                data={transformedAchievementTypeList}
                {...getInputProps("performance")}
              />
            </BasicRow>
          </RowGroup>
          <RowGroup>
            <BasicRow field="논문/특허 제목">
              <InputBase w={400} {...getInputProps("paperTitle")} />
            </BasicRow>
          </RowGroup>
          <RowGroup>
            <BasicRow field="학술지명/학술대회명">
              <InputBase w={400} {...getInputProps("journalName")} />
            </BasicRow>
          </RowGroup>
          <RowGroup>
            <BasicRow field="ISSN">
              <Group justify="space-between">
                <InputBase
                  w={100}
                  component={IMaskInput}
                  mask={/^[0-9a-zA-Z]{1,4}$/}
                  {...getInputProps("ISSN1")}
                />
                {" - "}
                <InputBase
                  w={100}
                  component={IMaskInput}
                  mask={/^[0-9a-zA-Z]{1,4}$/}
                  {...getInputProps("ISSN2")}
                />
              </Group>
            </BasicRow>
          </RowGroup>
          <RowGroup>
            <BasicRow field="게재년월">
              <DateInput
                leftSectionPointerEvents="none"
                leftSection={<IconCalendar size={20} />}
                valueFormat={DATE_FORMAT}
                locale="ko"
                {...getInputProps("publicationDate")}
              />
            </BasicRow>
          </RowGroup>
          <RowGroup>
            <BasicRow field="주저자 여부">
              <Select w={300} data={transformedAuthorTypeList} {...getInputProps("authorType")} />
            </BasicRow>
          </RowGroup>
          <RowGroup>
            <BasicRow field="저자 수">
              <Group wrap="nowrap">
                <NumberInput allowNegative={false} {...getInputProps("authorNumbers")} /> 명
              </Group>
            </BasicRow>
          </RowGroup>
          <RowGroup justify="center" withBorderBottom={false}>
            <Group ml="auto">
              <Button type="submit">{isEdit ? "수정하기" : "실적 등록"}</Button>
              {isEdit && (
                <Button color="red" onClick={() => setIsDeleting(true)}>
                  삭제하기
                </Button>
              )}
            </Group>
            <Button
              component="a"
              href={isAdmin ? "/admin/achievement" : "/student/achievement"}
              variant="subtle"
              ml="auto"
            >
              목록으로
            </Button>
          </RowGroup>
        </Stack>
      </form>
    </>
  );
}

export default AchievementForm;
