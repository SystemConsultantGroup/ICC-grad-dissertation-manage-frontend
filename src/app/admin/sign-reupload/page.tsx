import { AuthSSR } from "@/api/AuthSSR";
import PageHeader from "@/components/common/PageHeader";
import Section from "@/components/common/Section/Section";
import { SignReuploadStatusSection } from "@/components/pages/lists/admin/SignReuploadStatusSection";

export default async function AdminSignReuploadStatusPage() {
  await AuthSSR({ userType: "ADMIN" });

  return (
    <>
      <PageHeader
        title="서명 재업로드 현황"
        description="저장 서버 장애로 유실된 교수님 서명(도장)의 재업로드 현황입니다. 교수님은 계정 정보 수정에서 서명을 다시 올릴 수 있습니다."
      />
      <Section>
        <SignReuploadStatusSection />
      </Section>
    </>
  );
}
