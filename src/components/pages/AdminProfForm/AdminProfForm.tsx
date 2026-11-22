"use client";

import { useState, useEffect } from "react";
import { Button, Stack, Space, TextInput, PasswordInput, Group, Modal, Text } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { API_ROUTES } from "@/api/apiRoute";
import { useRouter } from "next/navigation";
import { ClientAxios } from "@/api/ClientAxios";
import { CommonApiResponse } from "@/api/_types/common";
import { RowGroup, BasicRow, TitleRow, ButtonRow } from "@/components/common/rows";
import { useAuth } from "@/components/common/AuthProvider/AuthProvider";
import { showNotificationError, showNotificationSuccess } from "@/components/common/Notifications";
import { DepartmentSelect } from "@/components/common/selects/DepartmentSelect";
import { User } from "@/api/_types/user";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertTriangle } from "@tabler/icons-react";

interface Props {
  professorId?: number | string;
}

interface AdminProfFormInputs {
  loginId: string;
  password: string;
  name: string;
  email?: string;
  phone?: string;
  deptId?: string;
}

function AdminProfForm({ professorId }: Props) {
  const router = useRouter();
  const { login, user } = useAuth();
  const [isPwEditing, setIsPwEditing] = useState<boolean>(false);
  const [defaultDepartmentId, setDefaultDepartmentId] = useState<string | null>(null);
  const [previousProf, setPreviousProf] = useState<User | undefined>();
  const [deleteOpened, { open: deleteOpen, close: deleteClose }] = useDisclosure(false);

  const {
    onSubmit,
    getInputProps,
    setValues,
    setFieldValue,
    values: profValues,
  } = useForm<AdminProfFormInputs>({
    initialValues: {
      loginId: "",
      password: "",
      name: "",
    },
    validate: {
      loginId: isNotEmpty("아이디를 입력해주세요."),
      password: isNotEmpty("비밀번호를 입력해주세요."),
      name: isNotEmpty("이름을 입력해주세요."),
      email: (value) =>
        value
          ? /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
            ? null
            : "이메일 형식이 맞지 않습니다."
          : undefined,
      phone: undefined,
    },
  });

  useEffect(() => {
    const fetchProfessorDetails = async () => {
      try {
        if (user?.type === "ADMIN" && professorId) {
          const response = await ClientAxios.get(API_ROUTES.professor.get(professorId));
          const professorDetails = response.data;
          setPreviousProf(professorDetails);
          setValues({
            loginId: professorDetails.loginId,
            password: "",
            name: professorDetails.name,
            email: professorDetails.email,
            phone: professorDetails.phone,
            deptId: String(professorDetails.department?.id),
          });
          setDefaultDepartmentId(String(professorDetails.department?.id));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfessorDetails();
  }, [professorId, setValues, user]);

  const handleSubmit = async (values: AdminProfFormInputs) => {
    try {
      if (isPwEditing && values.password === "") {
        showNotificationError({
          message: "수정할 비밀번호를 입력하거나, 수정 취소 버튼을 눌러주세요.",
        });
      } else {
        const body = professorId
          ? {
              ...(isPwEditing ? { password: values.password } : {}),
              loginId: previousProf!.loginId === values.loginId ? undefined : values.loginId,
              name: previousProf!.name === values.name ? undefined : values.name,
              deptId:
                previousProf!.department?.id === Number(values.deptId)
                  ? undefined
                  : Number(values.deptId),
              email:
                previousProf!.email === values.email
                  ? undefined
                  : values.email === ""
                    ? undefined
                    : values.email,
              phone:
                previousProf!.phone === values.phone
                  ? undefined
                  : values.phone === ""
                    ? undefined
                    : values.phone,
            }
          : {
              loginId: values.loginId,
              password: values.password,
              name: values.name,
              email: values.email === "" ? undefined : values.email,
              phone: values.phone === "" ? undefined : values.phone,
              deptId: values.deptId ? values.deptId : undefined,
            };
        if (!professorId) {
          await ClientAxios.post(API_ROUTES.professor.post(), body);
          showNotificationSuccess({ message: "교수 등록이 완료되었습니다." });
          router.push("/admin/professors");
        } else {
          await ClientAxios.put(API_ROUTES.professor.put(professorId), body);
          showNotificationSuccess({ message: "교수 정보 수정이 완료되었습니다." });
          router.push(`/admin/professors/${professorId}`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async () => {
    try {
      const {
        data: { accessToken },
      } = await ClientAxios.get<CommonApiResponse & { accessToken: string }>(
        `/auth/${professorId}`
      );
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
      await ClientAxios.delete(API_ROUTES.professor.delete(professorId));
      showNotificationSuccess({ message: "교수 삭제 완료" });
      deleteClose();
      router.push("/admin/professors");
    } catch (error) {
      /* empty */
    }
  };

  return (
    <Stack gap={0}>
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
            <Text fw={600}>{profValues.name} 교수를 삭제하시겠습니까?</Text>
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
      {professorId && (
        <RowGroup>
          <ButtonRow
            buttons={[
              <Button key="delete" color="red" onClick={deleteOpen}>
                교수 삭제
              </Button>,
              <Button key="login" onClick={() => handleLogin()}>
                로그인하기
              </Button>,
              <Button key="goback" variant="outline" onClick={handleBack}>
                뒤로가기
              </Button>,
            ]}
          />
        </RowGroup>
      )}
      <TitleRow title="교수 기본 정보" />
      <form onSubmit={onSubmit(handleSubmit)}>
        <Stack gap={0}>
          <RowGroup>
            <BasicRow field="아이디">
              <TextInput id="input-id" {...getInputProps("loginId")} />
            </BasicRow>
          </RowGroup>
          <RowGroup>
            <BasicRow field="비밀번호">
              {professorId ? (
                <Group>
                  <PasswordInput
                    id="input-password"
                    {...getInputProps("password")}
                    disabled={!isPwEditing}
                  />
                  {isPwEditing ? (
                    <Button
                      onClick={() => {
                        setFieldValue("password", "");
                        setIsPwEditing(false);
                      }}
                      color="red"
                    >
                      취소
                    </Button>
                  ) : (
                    <Button onClick={() => setIsPwEditing(true)}>수정하기</Button>
                  )}
                </Group>
              ) : (
                <PasswordInput id="input-password" {...getInputProps("password")} />
              )}
            </BasicRow>
          </RowGroup>
          <RowGroup>
            <BasicRow field="이름">
              <TextInput id="input-name" {...getInputProps("name")} />
            </BasicRow>
          </RowGroup>
          <RowGroup>
            <BasicRow field="이메일">
              <TextInput id="input-email" {...getInputProps("email")} />
            </BasicRow>
          </RowGroup>
          <RowGroup>
            <BasicRow field="연락처">
              <TextInput id="input-phone" {...getInputProps("phone")} />
            </BasicRow>
          </RowGroup>
          <RowGroup>
            <BasicRow field="소속">
              <DepartmentSelect
                {...getInputProps("deptId")}
                styles={{
                  wrapper: {
                    width: 300,
                  },
                }}
                defaultValue={defaultDepartmentId}
              />
            </BasicRow>
          </RowGroup>
          <Space h="md" />
          <RowGroup>
            {professorId ? (
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
    </Stack>
  );
}

export default AdminProfForm;
