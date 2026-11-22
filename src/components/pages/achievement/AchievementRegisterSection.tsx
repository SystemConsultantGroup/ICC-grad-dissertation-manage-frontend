"use client";

import { isNotEmpty, useForm } from "@mantine/form";
import AchievementForm, {
  AchievementFormInput,
} from "@/components/pages/achievement/AchievementForm";
import { TitleRow } from "@/components/common/rows";
import { ClientAxios } from "@/api/ClientAxios";
import { API_ROUTES } from "@/api/apiRoute";
import { showNotificationSuccess } from "@/components/common/Notifications";
import { useRouter } from "next/navigation";
import { Achievement } from "@/api/_types/achievement";
import { useAuth } from "@/components/common/AuthProvider";

function AchievementRegisterSection() {
  const { user } = useAuth();
  const router = useRouter();
  const form = useForm<AchievementFormInput>({
    validate: {
      performance: isNotEmpty("논문 실적 구분을 입력하세요."),
      paperTitle: isNotEmpty("논문/특허 제목을 입력하세요."),
      journalName: isNotEmpty("학술지명/학술대회명을 입력하세요."),
      publicationDate: isNotEmpty("게재년월을 입력하세요."),
      authorType: isNotEmpty("주저자 여부를 입력하세요."),
      authorNumbers: isNotEmpty("저자 수를 입력하세요."),
    },
  });

  const handleSubmit = async (input: AchievementFormInput) => {
    const body = { ...input, ISSN: input.ISSN1 && input.ISSN1 && input.ISSN1 + input.ISSN2 };
    try {
      await ClientAxios.post<Achievement>(API_ROUTES.achievement.post(), body, {
        params: { id: user?.id },
      });
      showNotificationSuccess({ message: "연구 실적이 등록되었습니다." });
      router.push("/student/achievement");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <TitleRow title="연구실적 등록" />
      <AchievementForm form={form} handleSubmit={handleSubmit} />
    </>
  );
}

export default AchievementRegisterSection;
