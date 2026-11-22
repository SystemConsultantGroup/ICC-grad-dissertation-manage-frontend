import { AuthSSR } from "@/api/AuthSSR";
import MainImage from "@/components/common/MainImage";
import ReuploadAlert from "@/components/pages/reupload/ReuploadAlert";

export default async function StudentPage() {
  await AuthSSR({ userType: "STUDENT", otherUserType: "PHD" });

  return (
    <>
      <ReuploadAlert />
      <MainImage />
    </>
  );
}
