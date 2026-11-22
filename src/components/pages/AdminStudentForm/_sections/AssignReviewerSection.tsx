import { useState, useEffect } from "react";
import { Stack, Select, Button, ComboboxData } from "@mantine/core";
import { RowGroup, BasicRow, TitleRow } from "@/components/common/rows";
import { ClientAxios } from "@/api/ClientAxios";
import { API_ROUTES } from "@/api/apiRoute";
import { PAGE_NUMBER_GET_ALL, PAGE_SIZE_GET_ALL } from "@/constants/pagination";
import { Professor, ReviewerRole } from "@/api/_types/professors";
import { useProfessors } from "@/api/SWR";
import { showNotificationError } from "@/components/common/Notifications";
import { SelectedProfessor } from "../_types/AdminStudentForm";

interface Props {
  studentId?: string | number;

  headReviewer: SelectedProfessor | null;
  advisors: SelectedProfessor[];
  committees: SelectedProfessor[];

  token?: boolean;

  onChangeReviewerCancle: (
    role: ReviewerRole,
    cancleReviewerId: string,
    clearSelectedReviewer: (isCancle: boolean, role?: ReviewerRole) => void
  ) => void;
  onChangeReviewerAdd: (
    role: ReviewerRole,
    profId: string,
    clearSelectedReviewer: (isCancle: boolean, role?: ReviewerRole) => void
  ) => void;
  onChangeReviewersSet?: (
    _headReviewer: Professor,
    _advisors: Professor[],
    _committees: Professor[]
  ) => void;

  isPhd: boolean;
  phdLoading: boolean;
}

interface SelectedReviewer {
  value: string;
  label: string;
}

function AssignReviewerSection({
  onChangeReviewerCancle,
  onChangeReviewerAdd,
  onChangeReviewersSet,
  headReviewer,
  advisors,
  committees,
  studentId,
  token = false,
  isPhd,
  phdLoading,
}: Props) {
  /** 교수 목록, 학과 목록 조회 */
  const { data: professors, isLoading: isLoadingProf } = useProfessors(
    { pageNumber: PAGE_NUMBER_GET_ALL, pageSize: PAGE_SIZE_GET_ALL },
    token
  );

  const [professorsSelectData, setProfessorsSelectData] = useState<ComboboxData>();

  /** Select 컴포넌트에서 선택된 심사위원  */
  const [cancleReviewerId, setCancleReviewerId] = useState<string | null>();
  const [selectedAdvisor, setSelectedAdvisor] = useState<SelectedProfessor>({
    profId: null,
  });
  const [selectedCommittee, setSelectedCommittee] = useState<SelectedProfessor>({
    profId: null,
  });
  const [selectedHeadReviewer, setSelectedHeadReviewer] = useState<SelectedProfessor>({
    profId: null,
  });
  const [selectedReviewers, setSelectedReviwers] = useState<SelectedReviewer[]>([]);

  /** 배정 취소 Select 에러 상태 */
  const [cancleError, setCancleError] = useState<boolean>(false);

  /** 배정된 교수 목록 조회시 label 설정하는 함수 */
  const assignedReviewerLabel = (role: ReviewerRole, professorId: number) => {
    if (!isLoadingProf) {
      const professor = professors?.find((prof) => prof.id === professorId) || ({} as Professor);
      const name = professor.department
        ? `${professor.name} (${professor.department.name})`
        : `${professor.name}`;
      switch (role) {
        case "HEAD":
          return `[심사위원장] ${name}`;
        case "ADVISOR":
          return `[지도교수] ${name}`;
        case "COMMITTEE":
          return `[심사위원] ${name}`;
        default:
          return "";
      }
    }
    return "";
  };

  /** 선택 초기화 하는 함수 */
  const clearSelectedReviewer = (isCancle: boolean, role?: ReviewerRole) => {
    if (isCancle) {
      setCancleReviewerId(null);
    } else {
      switch (role) {
        case "HEAD":
          setSelectedHeadReviewer((prev) => ({
            ...prev,
            profId: null,
          }));
          break;
        case "ADVISOR":
          setSelectedAdvisor((prev) => ({
            ...prev,
            profId: null,
          }));
          break;
        case "COMMITTEE":
          setSelectedCommittee((prev) => ({
            ...prev,
            profId: null,
          }));
          break;
      }
    }
  };

  /** 심사위원 정보 조회 */
  useEffect(() => {
    const setProfessorsData = () => {
      let data: ComboboxData = [];
      if (!isLoadingProf) {
        data = professors
          ? professors
              .map((professor) => ({
                label: professor.department
                  ? `${professor.name} (${professor.department.name})`
                  : `${professor.name}`,
                value: String(professor.id),
              }))
              .sort((a, b) => a.label.localeCompare(b.label))
          : [];
      }
      setProfessorsSelectData(data);
    };

    const fetchReviewer = async () => {
      if (studentId && onChangeReviewersSet && token && !isPhd && !phdLoading) {
        const response = await ClientAxios.get(API_ROUTES.student.getReviewer(Number(studentId)));
        const reviewerDetails = response.data;
        onChangeReviewersSet(
          reviewerDetails.headReviewer,
          reviewerDetails.advisors,
          reviewerDetails.committees
        );
      }
    };

    fetchReviewer();
    setProfessorsData();
  }, [studentId, isLoadingProf, token]); // eslint-disable-line react-hooks/exhaustive-deps

  /** 배정된 교수 목록 업데이트 */
  useEffect(() => {
    setSelectedReviwers([
      ...(headReviewer
        ? [
            {
              value: headReviewer.profId ?? "",
              label: assignedReviewerLabel("HEAD", Number(headReviewer.profId)),
            },
          ]
        : []),
      ...advisors.map((advisor) => ({
        value: advisor.profId ?? "",
        label: assignedReviewerLabel("ADVISOR", Number(advisor.profId)),
      })),
      ...committees.map((committee) => ({
        value: committee.profId ?? "",
        label: assignedReviewerLabel("COMMITTEE", Number(committee.profId)),
      })),
    ]);
  }, [advisors, committees, headReviewer]); // eslint-disable-line react-hooks/exhaustive-deps

  /** 배정 취소 */
  const handleCancle = () => {
    if (cancleReviewerId) {
      if (headReviewer?.profId === cancleReviewerId) {
        onChangeReviewerCancle("HEAD", cancleReviewerId, clearSelectedReviewer);
      } else if (advisors.some((advisor) => advisor.profId === cancleReviewerId)) {
        onChangeReviewerCancle("ADVISOR", cancleReviewerId, clearSelectedReviewer);
      } else if (committees.some((committee) => committee.profId === cancleReviewerId)) {
        onChangeReviewerCancle("COMMITTEE", cancleReviewerId, clearSelectedReviewer);
      } else {
        setCancleError(true);
      }
    }
  };

  /** 지도교수 선택 */
  const handleAdvisorSelect = () => {
    const isDuplicate = selectedReviewers.some(
      (reviewer) => reviewer.value === selectedAdvisor.profId
    );

    if (isDuplicate) {
      showNotificationError({ message: "중복된 배정입니다. 배정 교수 목록을 확인해주세요." });
    } else if (selectedAdvisor.profId) {
      onChangeReviewerAdd("ADVISOR", selectedAdvisor.profId, clearSelectedReviewer);
    }
  };

  /** 심사위원 선택 */
  const handleCommitteeSelect = () => {
    const isDuplicate = selectedReviewers.some(
      (reviewer) => reviewer.value === selectedCommittee.profId
    );

    if (isDuplicate) {
      showNotificationError({ message: "중복된 배정입니다. 배정 교수 목록을 확인해주세요." });
    } else if (selectedCommittee.profId) {
      onChangeReviewerAdd("COMMITTEE", selectedCommittee.profId, clearSelectedReviewer);
    }
  };

  /** 심사위원장 선택 */
  const handleHeadReviewerSelect = () => {
    const isDuplicate = selectedReviewers.some(
      (reviewer) => reviewer.value === selectedHeadReviewer.profId
    );

    if (isDuplicate) {
      showNotificationError({ message: "중복된 배정입니다. 배정 교수 목록을 확인해주세요." });
    } else if (selectedHeadReviewer.profId) {
      onChangeReviewerAdd("HEAD", selectedHeadReviewer.profId, clearSelectedReviewer);
    }
  };

  return (
    <Stack gap={0}>
      <TitleRow title="교수 배정 정보" />
      <RowGroup>
        <BasicRow field="배정 교수 목록">
          <Select
            placeholder="배정된 교수 조회"
            onChange={setCancleReviewerId}
            value={cancleReviewerId}
            styles={{
              wrapper: {
                width: 300,
              },
            }}
            error={cancleError}
            data={selectedReviewers}
          />
          <Button color="red" style={{ marginLeft: "20px" }} onClick={handleCancle}>
            배정 취소
          </Button>
        </BasicRow>
      </RowGroup>
      <RowGroup>
        <BasicRow field="지도교수 배정">
          <Select
            placeholder="교수를 선택해주세요"
            styles={{
              wrapper: {
                width: 300,
              },
            }}
            data={professorsSelectData}
            value={selectedAdvisor.profId}
            onChange={(value) => {
              setSelectedAdvisor((prev) => ({
                ...prev,
                profId: value,
              }));
            }}
          />
          <Button style={{ marginLeft: "20px" }} onClick={handleAdvisorSelect}>
            배정하기
          </Button>
        </BasicRow>
      </RowGroup>
      <RowGroup>
        <BasicRow field="심사위원 배정">
          <Select
            placeholder="교수를 선택해주세요"
            styles={{
              wrapper: {
                width: 300,
              },
            }}
            data={professorsSelectData}
            value={selectedCommittee.profId}
            onChange={(value) => {
              setSelectedCommittee((prev) => ({
                ...prev,
                profId: value,
              }));
            }}
          />
          <Button style={{ marginLeft: "20px" }} onClick={handleCommitteeSelect}>
            배정하기
          </Button>
        </BasicRow>
      </RowGroup>
      <RowGroup>
        <BasicRow field="심사위원장 배정">
          <Select
            placeholder="교수를 선택해주세요"
            styles={{
              wrapper: {
                width: 300,
              },
            }}
            data={professorsSelectData}
            value={selectedHeadReviewer.profId}
            onChange={(value) => {
              setSelectedHeadReviewer((prev) => ({
                ...prev,
                profId: value,
              }));
            }}
          />
          <Button style={{ marginLeft: "20px" }} onClick={handleHeadReviewerSelect}>
            배정하기
          </Button>
        </BasicRow>
      </RowGroup>
    </Stack>
  );
}

export default AssignReviewerSection;
