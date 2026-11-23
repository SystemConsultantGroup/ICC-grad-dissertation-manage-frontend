import { AuthSSR } from "@/api/AuthSSR";
import PageHeader from "@/components/common/PageHeader";
import Section from "@/components/common/Section/Section";
import { ReuploadStatusSection } from "@/components/pages/lists/admin/ReuploadStatusSection";

export default async function AdminReuploadStatusPage() {
  await AuthSSR({ userType: "ADMIN" });

  return (
    <>
      <PageHeader
        title="파일 재업로드 현황"
        description="저장 서버 장애로 유실된 학생 제출 파일의 재업로드 진행 상황입니다. 각 행을 클릭하면 파일별 상태를 볼 수 있습니다."
      />
      <Section>
        <ReuploadStatusSection />
      </Section>
    </>
  );
}
