import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Stack, TextInput, PasswordInput, Select, Text, Button, Group } from "@mantine/core";
import { RowGroup, BasicRow, TitleRow, NoticeRow, ButtonRow } from "@/components/common/rows";
import { UseFormReturnType } from "@mantine/form";
import { ClientAxios } from "@/api/ClientAxios";
import { API_ROUTES } from "@/api/apiRoute";
import { Phase } from "@/api/_types/phase";
import { DepartmentSelect } from "@/components/common/selects/DepartmentSelect";
import { AdminStudentFormInputs } from "../_types/AdminStudentForm";

interface Props {
  form: UseFormReturnType<AdminStudentFormInputs>;
  studentId?: string | number;
  isPwEditing: boolean;
  handleIsPwEditing: Dispatch<SetStateAction<boolean>>;
  open: () => void;
  token?: boolean;
  isPhd?: boolean;
  phdLoading?: boolean;
}

function BasicInfoSection({
  form,
  studentId,
  isPwEditing,
  handleIsPwEditing,
  open,
  token,
  isPhd,
  phdLoading,
}: Props) {
  const [phase, setPhase] = useState<Phase>();
  const [phaseLoading, setPhaseLoading] = useState<boolean>(true);

  const [defaultDepartmentId, setDefaultDepartmentId] = useState<string | null>(null);

  useEffect(() => {
    // 학생 기본 정보 가져오기
    const fetchStudentDetails = async () => {
      try {
        if (studentId && token) {
          // 기본 정보 조회
          const response = await ClientAxios.get(API_ROUTES.student.get(studentId));
          const studentDetails = response.data;

          form.setFieldValue("basicInfo", {
            loginId: studentDetails.loginId,
            password: undefined,
            name: studentDetails.name,
            email: studentDetails.email,
            phone: studentDetails.phone,
            deptId: String(studentDetails.department.id),
          });
          setDefaultDepartmentId(String(studentDetails.department.id));
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchStudentDetails();
  }, [studentId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const loadPhase = async () => {
      setPhaseLoading(true);
      // 시스템 정보 조회
      if (!isPhd && !phdLoading && studentId) {
        const sysResponse = await ClientAxios.get(API_ROUTES.student.getSystem(studentId));
        const sysDetails = sysResponse.data;
        setPhase(sysDetails.phase);
      }
      setPhaseLoading(false);
    };

    if (studentId) {
      loadPhase();
    }
  }, [isPhd, phdLoading, studentId]);

  return (
    <Stack gap={0}>
      {studentId ? (
        <NoticeRow text="정보를 수정한 후, 하단의 수정하기 버튼을 눌러야 모든 수정사항이 반영됩니다." />
      ) : (
        <NoticeRow text="기존에 이미 등록된 학생의 경우, 학생 현황 및 관리 페이지를 이용해주세요." />
      )}
      <TitleRow title="학생 기본 정보" />
      <Stack gap={0}>
        <RowGroup>
          <BasicRow field="아이디">
            <TextInput id="input-id" {...form.getInputProps("basicInfo.loginId")} />
          </BasicRow>
        </RowGroup>
        <RowGroup>
          <BasicRow field="비밀번호">
            {studentId ? (
              <Group>
                <PasswordInput
                  id="input-password"
                  {...form.getInputProps("basicInfo.password")}
                  disabled={!isPwEditing}
                />
                {isPwEditing ? (
                  <Button
                    onClick={() => {
                      form.setFieldValue("basicInfo.password", "");
                      handleIsPwEditing(false);
                    }}
                    color="red"
                  >
                    취소
                  </Button>
                ) : (
                  <Button onClick={() => handleIsPwEditing(true)}>수정하기</Button>
                )}
              </Group>
            ) : (
              <PasswordInput id="input-password" {...form.getInputProps("basicInfo.password")} />
            )}
          </BasicRow>
        </RowGroup>
        <RowGroup>
          <BasicRow field="이름">
            <TextInput id="input-name" {...form.getInputProps("basicInfo.name")} />
          </BasicRow>
        </RowGroup>
        <RowGroup>
          <BasicRow field="이메일">
            <TextInput id="input-email" {...form.getInputProps("basicInfo.email")} />
          </BasicRow>
        </RowGroup>
        <RowGroup>
          <BasicRow field="연락처">
            <TextInput id="input-phone" {...form.getInputProps("basicInfo.phone")} />
          </BasicRow>
        </RowGroup>
        <RowGroup>
          <BasicRow field="학과">
            {token && (
              <DepartmentSelect
                styles={{
                  wrapper: {
                    width: 300,
                  },
                }}
                {...form.getInputProps("basicInfo.deptId")}
                defaultValue={defaultDepartmentId}
              />
            )}
          </BasicRow>
        </RowGroup>
        {!isPhd && (
          <RowGroup>
            <BasicRow field="시스템 단계">
              {studentId ? (
                !phaseLoading &&
                phase && (
                  <>
                    <Text style={{ width: 310 }}>{phase?.title}</Text>
                    {phase?.id === 3 && (
                      <ButtonRow
                        buttons={[
                          <Button key="switch" onClick={open}>
                            본심 전환
                          </Button>,
                        ]}
                      />
                    )}
                  </>
                )
              ) : (
                <Select
                  placeholder="예심/본심 여부 선택"
                  data={[
                    { value: "PRELIMINARY", label: "예심" },
                    { value: "MAIN", label: "본심" },
                  ]}
                  styles={{
                    wrapper: {
                      width: 300,
                    },
                  }}
                  {...form.getInputProps("stage")}
                />
              )}
            </BasicRow>
          </RowGroup>
        )}
      </Stack>
    </Stack>
  );
}

export default BasicInfoSection;
