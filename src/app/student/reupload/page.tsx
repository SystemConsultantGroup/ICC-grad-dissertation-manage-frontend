import { AuthSSR } from "@/api/AuthSSR";
import PageHeader from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";
import ReuploadForm from "@/components/pages/reupload/ReuploadForm/ReuploadForm";

export default async function StudentReuploadPage() {
  await AuthSSR({ userType: "STUDENT" });

  return (
    <>
      <PageHeader title="제출 파일 재업로드" />
      <Section>
        <ReuploadForm />
      </Section>
    </>
  );
}
