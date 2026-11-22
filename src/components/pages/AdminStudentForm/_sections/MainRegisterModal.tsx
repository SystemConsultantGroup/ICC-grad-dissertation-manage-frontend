import { IconEditCircle } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import Modal from "@/components/common/Modal";
import { ClientAxios } from "@/api/ClientAxios";
import { API_ROUTES } from "@/api/apiRoute";
import { Stack, Button } from "@mantine/core";
import { RowGroup, ButtonRow } from "@/components/common/rows";
import { useEffect } from "react";
import { showNotificationSuccess } from "@/components/common/Notifications/showNotificationSuccess";
import { useRouter } from "next/navigation";
import ThesisTitleSection from "./ThesisTitleSection";
import useReviewersAssign from "../_hooks/useReviewersAssign";
import { AdminStudentFormInputs, SelectedProfessor } from "../_types/AdminStudentForm";
import AssignReviewerSection from "./AssignReviewerSection";

interface Props {
  studentId: string | number | undefined;
  opened: boolean;
  close: () => void;
  token?: boolean;
}
function MainRegisterModal({ studentId, opened, close, token }: Props) {
  const sysMainForm = useForm<AdminStudentFormInputs>({});
  const router = useRouter();
  /** 본심 심사위원장 / 심사위원 설정*/
  const {
    headReviewer,
    advisors,
    committees,
    handleReviewerCancel,
    handleReviewerAdd,
    handleReviewersSet,
  } = useReviewersAssign();

  /** 본심 정보 등록하기 */
  const handleSubmit = async () => {
    try {
      if (studentId) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { basicInfo, ...sysMainValues } = sysMainForm.values;
        const body = {
          thesisTitle: sysMainValues.thesisTitle,
          headReviewerId: Number(headReviewer?.profId),
          advisorIds: advisors.map((advisor: SelectedProfessor) => Number(advisor.profId)),
          committeeIds: committees.map((committee: SelectedProfessor) => Number(committee.profId)),
        };
        await ClientAxios.put(API_ROUTES.student.putSystem(Number(studentId)), body);
        showNotificationSuccess({ message: "본심 전환이 완료되었습니다." });
        close();
        router.push(`/admin/students/${studentId}`);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (studentId && token) {
      const fetchReviewer = async () => {
        const response = await ClientAxios.get(API_ROUTES.student.getReviewer(Number(studentId)));
        const reviewerDetails = response.data;
        handleReviewersSet(
          reviewerDetails.headReviewer,
          reviewerDetails.advisors,
          reviewerDetails.committees
        );
      };
      fetchReviewer();
    }
  }, [studentId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="본심 정보 등록"
      icon={<IconEditCircle />}
      withCloseButton
      size="xl"
    >
      <form onSubmit={sysMainForm.onSubmit(handleSubmit)}>
        <Stack gap={10}>
          <AssignReviewerSection
            headReviewer={headReviewer}
            advisors={advisors}
            committees={committees}
            onChangeReviewerAdd={handleReviewerAdd}
            onChangeReviewerCancle={handleReviewerCancel}
            onChangeReviewersSet={handleReviewersSet}
            token={token}
            isPhd={false}
            phdLoading={false}
          />
          <ThesisTitleSection form={sysMainForm} />
          <RowGroup>
            <ButtonRow
              buttons={[
                <Button key="mainRegister" type="submit">
                  등록하기
                </Button>,
              ]}
            />
          </RowGroup>
        </Stack>
      </form>
    </Modal>
  );
}

export default MainRegisterModal;
