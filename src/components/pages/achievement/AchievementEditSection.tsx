"use client";

import { isNotEmpty, useForm } from "@mantine/form";
import AchievementForm, {
  AchievementFormInput,
} from "@/components/pages/achievement/AchievementForm";
import { TitleRow } from "@/components/common/rows";
import { Achievement } from "@/api/_types/achievement";
import { API_ROUTES } from "@/api/apiRoute";
import { ClientAxios } from "@/api/ClientAxios";
import { showNotificationSuccess } from "@/components/common/Notifications";
import { useAuth } from "@/components/common/AuthProvider";
import { useConditionalSWR } from "@/api/SWR/useConditionalSWR";
import { useEffect } from "react";

interface Props {
  id: number | string;
  isAdmin?: boolean;
}

function AchievementEditSection({ id, isAdmin }: Props) {
  const { token } = useAuth();
  const { data, mutate } = useConditionalSWR<Achievement>(
    { url: API_ROUTES.achievement.get(id), token },
    !!token
  );

  const transformedAchievement = data && {
    ...data,
    publicationDate: new Date(data.publicationDate),
    ISSN1: data.ISSN ? data.ISSN.slice(0, 4) : "",
    ISSN2: data.ISSN ? data.ISSN.slice(-4) : "",
  };

  const form = useForm<AchievementFormInput>({
    initialValues: transformedAchievement,
    validate: {
      performance: isNotEmpty("논문 실적 구분을 입력하세요."),
      paperTitle: isNotEmpty("논문/특허 제목을 입력하세요."),
      journalName: isNotEmpty("학술지명/학술대회명을 입력하세요."),
      publicationDate: isNotEmpty("게재년월을 입력하세요."),
      authorType: isNotEmpty("주저자 여부를 입력하세요."),
      authorNumbers: isNotEmpty("저자 수를 입력하세요."),
    },
  });

  useEffect(() => {
    if (data) {
      form.setValues({
        ...data,
        publicationDate: new Date(data.publicationDate),
        ISSN1: data.ISSN ? data.ISSN.slice(0, 4) : "",
        ISSN2: data.ISSN ? data.ISSN.slice(-4) : "",
      });
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (input: AchievementFormInput) => {
    const body = { ...input, ISSN: input.ISSN1 && input.ISSN1 && input.ISSN1 + input.ISSN2 };
    try {
      await ClientAxios.put(API_ROUTES.achievement.put(id), body);
      await mutate();
      showNotificationSuccess({ message: "실적 정보가 수정되었습니다." });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <TitleRow title="연구실적 상세보기" />
      <AchievementForm form={form} handleSubmit={handleSubmit} isEdit isAdmin={isAdmin} />
    </>
  );
}

export default AchievementEditSection;
