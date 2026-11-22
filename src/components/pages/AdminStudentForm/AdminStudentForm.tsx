"use client";

import { useEffect, useState } from "react";
import { Stack, Button, Modal, Group, Text, Switch } from "@mantine/core";
import { ClientAxios } from "@/api/ClientAxios";
import { useRouter } from "next/navigation";
import { API_ROUTES } from "@/api/apiRoute";
import { useForm, isNotEmpty } from "@mantine/form";
import { RowGroup, ButtonRow, BasicRow } from "@/components/common/rows";
import { CommonApiResponse } from "@/api/_types/common";
import { showNotificationError, showNotificationSuccess } from "@/components/common/Notifications";
import { useAuth } from "@/components/common/AuthProvider/AuthProvider";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertTriangle } from "@tabler/icons-react";
import BasicInfoSection from "./_sections/BasicInfoSection";
import AssignReviewerSection from "./_sections/AssignReviewerSection";
import ThesisTitleSection from "./_sections/ThesisTitleSection";
import ThesisInfoSection from "./_sections/ThesisInfoSection";
import { AdminStudentFormInputs, SelectedProfessor } from "./_types/AdminStudentForm";
import useReviewersAssign from "./_hooks/useReviewersAssign";
import MainRegisterModal from "./_sections/MainRegisterModal";

interface Props {
  studentId?: string | number;
  token?: string;
}

function AdminStudentForm({ studentId, token }: Props) {
  const router = useRouter();
  const { login, isLoading, user } = useAuth();
  const [isPwEditing, setIsPwEditing] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [opened, { open, close }] = useDisclosure();
  const [deleteOpened, { open: deleteOpen, close: deleteClose }] = useDisclosure(false);
  const {
    headReviewer,
    advisors,
    committees,
    prevReviewersRef,
    handleReviewerCancel,
    handleReviewerAdd,
    handleReviewersSet,
  } = useReviewersAssign();
  const [isPhd, setIsPhd] = useState<boolean>(false);
  const [phdLoading, setPhdLoading] = useState<boolean>(true);

  const form = useForm<AdminStudentFormInputs>({
    initialValues: {
      basicInfo: {
        loginId: "",
        password: studentId ? undefined : "",
        name: "",
        deptId: "",
      },

      stage: null,

      thesisTitle: "",
    },
    validate: {
      basicInfo: {
        loginId: isNotEmpty("아이디를 입력해주세요."),
        name: isNotEmpty("이름을 입력해주세요."),
        email: (value) =>
          value
            ? /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
              ? null
              : "이메일 형식이 맞지 않습니다."
            : undefined,
        phone: (value) =>
          value
            ? /^\d{3}-\d{3,4}-\d{4}$/.test(value)
              ? null
              : "전화번호 형식이 맞지 않습니다."
            : undefined,
        deptId: isNotEmpty("소속 학과를 선택해주세요."),
      },

      // 등록시에만 validate 적용
      stage: (value) =>
        studentId || isPhd ? undefined : value ? null : "예심/본심 단계를 선택해주세요.",
    },
  });

  const handleLogin = async () => {
    try {
      const {
        data: { accessToken },
      } = await ClientAxios.get<CommonApiResponse & { accessToken: string }>(`/auth/${studentId}`);
      setIsAdmin(false);
      login(accessToken);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleDelete = async () => {
    try {
      await ClientAxios.delete(API_ROUTES.student.delete(studentId));
      showNotificationSuccess({ message: "학생 삭제 완료" });
      deleteClose();
      router.push("/admin/students");
    } catch (error) {
      /* empty */
    }
  };

  const handleSubmit = async () => {
    try {
      if (isPwEditing && form.values.basicInfo.password === undefined) {
        showNotificationError({
          message: "수정할 비밀번호를 입력하거나, 수정 취소 버튼을 눌러주세요.",
        });
      } else {
        let previous;
        if (studentId) {
          previous = (await ClientAxios.get(API_ROUTES.student.get(studentId))).data;
        }
        const basicInfo = studentId
          ? {
              ...(isPwEditing ? { password: form.values.basicInfo.password } : {}),
              loginId:
                previous.loginId === form.values.basicInfo.loginId
                  ? undefined
                  : form.values.basicInfo.loginId,
              name:
                previous.name === form.values.basicInfo.name
                  ? undefined
                  : form.values.basicInfo.name,
              deptId:
                previous.deptId === form.values.basicInfo.deptId
                  ? undefined
                  : Number(form.values.basicInfo.deptId),
              email:
                previous.email === form.values.basicInfo.email
                  ? undefined
                  : form.values.basicInfo.email,
              phone:
                previous.phone === form.values.basicInfo.phone
                  ? undefined
                  : form.values.basicInfo.phone,
            }
          : {
              ...form.values.basicInfo,
            };
        if (headReviewer && checkReviewersLength(advisors) && checkReviewersLength(committees)) {
          if (!studentId) {
            /** 학생 등록 */
            const registerInputs = {
              ...basicInfo,
              stage: form.values.stage,
              thesisTitle: form.values.thesisTitle,
              headReviewerId: Number(headReviewer.profId),
              advisorIds: advisors.map((advisor: SelectedProfessor) => Number(advisor.profId)),
              committeeIds: committees.map((committee: SelectedProfessor) =>
                Number(committee.profId)
              ),
            };
            await ClientAxios.post(API_ROUTES.student.post(), registerInputs);
            showNotificationSuccess({ message: "학생 등록이 완료되었습니다." });
            router.push("/admin/students");
          } else {
            /** 학생 회원 정보 수정 */
            await ClientAxios.put(API_ROUTES.student.put(studentId), basicInfo);

            /** 심사위원장 교체 */
            const prevHeadReviewer = prevReviewersRef.current?.headReviewer;
            if (prevHeadReviewer !== Number(headReviewer.profId)) {
              await ClientAxios.put(
                API_ROUTES.student.putHeadReviewer(Number(studentId), Number(headReviewer.profId))
              );
            }

            /** 배정 및 배정 취소된 지도교수 id */
            const prevAdvisors = prevReviewersRef.current?.advisors;
            const advisorIds = advisors.map((advisor) => Number(advisor.profId));
            const deletedAdvisorIds = prevAdvisors
              ? prevAdvisors.filter((prevAdvisor) => !advisorIds.includes(prevAdvisor))
              : [];
            const addedAdvisorIds = prevAdvisors
              ? advisorIds.filter((advisorId) => !prevAdvisors.includes(advisorId))
              : [];

            /** 배정 및 배정 취소된 심사위원 id */
            const prevCommittees = prevReviewersRef.current?.committees;
            const committeeIds = committees.map((committee) => Number(committee.profId));
            const deletedCommitteeIds = prevCommittees
              ? prevCommittees.filter((prevAdvisor) => !committeeIds.includes(prevAdvisor))
              : [];
            const addedCommitteeIds = prevCommittees
              ? committeeIds.filter((committeeId) => !prevCommittees.includes(committeeId))
              : [];

            /** 지도교수, 심사위원 배정 취소 */
            const deletePromises = [
              ...deletedAdvisorIds.map((deletedId) =>
                ClientAxios.delete(API_ROUTES.student.deleteReviewer(Number(studentId), deletedId))
              ),
              ...deletedCommitteeIds.map((deletedId) =>
                ClientAxios.delete(API_ROUTES.student.deleteReviewer(Number(studentId), deletedId))
              ),
            ];
            await Promise.all(deletePromises);

            /** 지도교수, 심사위원 배정 */
            const postPromises = [
              ...addedAdvisorIds.map((addedId) =>
                ClientAxios.post(
                  `${API_ROUTES.student.putReviewer(Number(studentId), addedId)}?role=advisor`
                )
              ),
              ...addedCommitteeIds.map((addedId) =>
                ClientAxios.post(
                  `${API_ROUTES.student.putReviewer(Number(studentId), addedId)}?role=committee`
                )
              ),
            ];
            await Promise.all(postPromises);

            showNotificationSuccess({ message: "학생 정보 수정이 완료되었습니다." });
            router.push(`/admin/students/${studentId}`);
            router.refresh();
          }
        } else {
          showNotificationError({
            title: "교수 배정 정보가 올바르지 않습니다.",
            message:
              "심사위원장 배정이 되어있는지, 지도교수와 심사위원이 최소 한 명 이상 두 명 이하로 배정되었는지 확인해주세요.",
          });
        }
      }
    } catch (error) {
      let message = "Unknown Error";
      if (error instanceof Error) message = error.message;
      showNotificationError({ message });
    }
  };

  const handlePhd = async () => {
    try {
      if (isPwEditing && form.values.basicInfo.password === undefined) {
        showNotificationError({
          message: "수정할 비밀번호를 입력하거나, 수정 취소 버튼을 눌러주세요.",
        });
      } else {
        let previous;
        if (studentId) {
          previous = (await ClientAxios.get(API_ROUTES.student.get(studentId))).data;
        }
        const basicInfo = studentId
          ? {
              ...(isPwEditing ? { password: form.values.basicInfo.password } : {}),
              loginId:
                previous.loginId === form.values.basicInfo.loginId
                  ? undefined
                  : form.values.basicInfo.loginId,
              name:
                previous.name === form.values.basicInfo.name
                  ? undefined
                  : form.values.basicInfo.name,
              deptId:
                previous.deptId === form.values.basicInfo.deptId
                  ? undefined
                  : Number(form.values.basicInfo.deptId),
              email:
                previous.email === form.values.basicInfo.email
                  ? undefined
                  : form.values.basicInfo.email,
              phone:
                previous.phone === form.values.basicInfo.phone
                  ? undefined
                  : form.values.basicInfo.phone,
            }
          : {
              ...form.values.basicInfo,
            };
        if (!studentId) {
          await ClientAxios.post(API_ROUTES.student.phd(), basicInfo);
          showNotificationSuccess({ message: "학생 등록이 완료되었습니다." });
          router.push("/admin/students");
        } else {
          await ClientAxios.put(API_ROUTES.student.put(studentId), basicInfo);
          showNotificationSuccess({ message: "학생 정보 수정이 완료되었습니다." });
          router.push(`/admin/students/${studentId}`);
          router.refresh();
        }
      }
    } catch (error) {
      let message = "Unknown Error";
      if (error instanceof Error) message = error.message;
      showNotificationError({ message });
    }
  };

  const checkReviewersLength = (list: SelectedProfessor[]) => list.length >= 1 && list.length <= 2;

  useEffect(() => {
    if (!isLoading) {
      setIsAdmin(user?.type === "ADMIN");
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fetchPhd = async () => {
      if (studentId && token) {
        const { data } = await ClientAxios.get(API_ROUTES.student.get(studentId), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (data.type === "PHD") {
          setIsPhd(true);
        }
        setPhdLoading(false);
      }
    };
    fetchPhd();
    if (!studentId) {
      setPhdLoading(false);
    }
  }, [studentId, token]);

  return (
    <>
      <Modal
        opened={deleteOpened}
        onClose={deleteClose}
        withCloseButton={false}
        centered
        radius="lg"
      >
        <Stack gap={36} align="center" p="lg">
          <IconAlertTriangle color="red" />
          <Group align="center" justify="center">
            <Text fw={600}>{form.values.basicInfo.name} 학생을 삭제하시겠습니까?</Text>
          </Group>
          <Group>
            <Button key="cancel" variant="outline" onClick={deleteClose}>
              취소
            </Button>
            <Button key="delete" color="red" onClick={handleDelete}>
              삭제
            </Button>
          </Group>
        </Stack>
      </Modal>
      {studentId && !isPhd && !phdLoading && (
        <MainRegisterModal studentId={studentId} opened={opened} close={close} token={isAdmin} />
      )}
      <form onSubmit={isPhd ? form.onSubmit(handlePhd) : form.onSubmit(handleSubmit)}>
        <Stack gap="xl">
          {studentId && (
            <RowGroup withBorderBottom={false}>
              <ButtonRow
                buttons={[
                  <Button key="delete" color="red" onClick={deleteOpen}>
                    학생 삭제
                  </Button>,
                  <Button key="login" onClick={handleLogin}>
                    로그인하기
                  </Button>,
                  <Button key="goback" variant="outline" onClick={handleBack}>
                    뒤로가기
                  </Button>,
                ]}
              />
            </RowGroup>
          )}
          {!studentId && (
            <RowGroup withBorderBottom={false}>
              <BasicRow field="박사과정">
                <Switch
                  checked={isPhd}
                  onChange={(e) => setIsPhd(e.currentTarget.checked)}
                ></Switch>
              </BasicRow>
            </RowGroup>
          )}
          <BasicInfoSection
            form={form}
            studentId={studentId}
            isPwEditing={isPwEditing}
            handleIsPwEditing={setIsPwEditing}
            open={open}
            token={isAdmin}
            isPhd={isPhd}
            phdLoading={phdLoading}
          />
          {!isPhd && !phdLoading ? (
            <AssignReviewerSection
              studentId={studentId}
              headReviewer={headReviewer}
              advisors={advisors}
              committees={committees}
              onChangeReviewerAdd={handleReviewerAdd}
              onChangeReviewerCancle={handleReviewerCancel}
              onChangeReviewersSet={handleReviewersSet}
              token={isAdmin}
              isPhd={isPhd}
              phdLoading={phdLoading}
            />
          ) : (
            <></>
          )}
          {!isPhd && !phdLoading ? (
            studentId ? (
              <ThesisInfoSection studentId={studentId} token={isAdmin} />
            ) : (
              <ThesisTitleSection form={form} />
            )
          ) : (
            <></>
          )}
          <RowGroup>
            {studentId ? (
              <ButtonRow
                buttons={[
                  <Button key="edit" type="submit">
                    수정하기
                  </Button>,
                ]}
              />
            ) : (
              <ButtonRow
                buttons={[
                  <Button key="register" type="submit">
                    등록하기
                  </Button>,
                ]}
              />
            )}
          </RowGroup>
        </Stack>
      </form>
    </>
  );
}

export default AdminStudentForm;
