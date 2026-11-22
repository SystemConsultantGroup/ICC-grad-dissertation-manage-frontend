"use client";

import { Button, Group, PasswordInput, Stack, TextInput } from "@mantine/core";
import BasicRow from "@/components/common/rows/BasicRow/BasicRow";
import ButtonRow from "@/components/common/rows/ButtonRow/ButtonRow";
import { FileUploadRow, RowGroup } from "@/components/common/rows";
import { useAuth } from "@/components/common/AuthProvider";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { ClientAxios } from "@/api/ClientAxios";
import { API_ROUTES } from "@/api/apiRoute";
import { showNotificationSuccess } from "@/components/common/Notifications";
import { uploadFile } from "@/api/uploadFile";

interface UserInfoEditFormInputs {
  password: string;
  email?: string;
  phone?: string;
  signFile?: File | null;
}

function UserInfoEditSection() {
  const { user, isLoading } = useAuth();
  const [isPwEditing, setIsPwEditing] = useState(false);

  const form = useForm<UserInfoEditFormInputs>({
    initialValues: {
      password: "",
      email: user?.email,
      phone: user?.phone,
      signFile: null,
    },
    validate: {
      password: (value, values) =>
        isPwEditing && !values.password ? "비밀번호를 입력하거나 수정을 취소해주세요." : null,
    },
  });

  useEffect(() => {
    if (!isLoading) {
      form.values.email = user?.email;
      form.values.phone = user?.phone;
      form.setValues({
        signFile: user?.signFile ? undefined : null,
      });
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (values: UserInfoEditFormInputs) => {
    try {
      const signFileUUID = values.signFile
        ? (await uploadFile({ file: values.signFile! })).uuid
        : undefined;
      const body = {
        password: isPwEditing ? values.password : undefined,
        email: form.isDirty("email") ? values.email : undefined,
        phone: form.isDirty("phone") ? values.phone : undefined,
        signId: signFileUUID || undefined,
      };
      await ClientAxios.put(API_ROUTES.user.put(), body);
      showNotificationSuccess({ message: "회원 정보가 수정되었습니다." });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap={0}>
        <RowGroup>
          <BasicRow field="아이디">{user?.loginId}</BasicRow>
        </RowGroup>
        <RowGroup>
          <BasicRow field="비밀번호">
            <Group>
              <PasswordInput {...form.getInputProps("password")} disabled={!isPwEditing} />
              {isPwEditing ? (
                <Group>
                  <Button
                    onClick={() => {
                      form.setFieldValue("password", "");
                      setIsPwEditing(false);
                    }}
                    color="red"
                  >
                    취소
                  </Button>
                </Group>
              ) : (
                <Group>
                  <Button onClick={() => setIsPwEditing(true)}>수정하기</Button>
                </Group>
              )}
            </Group>
          </BasicRow>
        </RowGroup>
        {user?.type !== "ADMIN" && (
          <>
            <RowGroup>
              <BasicRow field="이름">{user?.name}</BasicRow>
            </RowGroup>
            <RowGroup>
              <BasicRow field="이메일">
                <TextInput {...form.getInputProps("email")} />
              </BasicRow>
            </RowGroup>
            <RowGroup>
              <BasicRow field="연락처">
                <TextInput {...form.getInputProps("phone")} />
              </BasicRow>
            </RowGroup>
            <RowGroup>
              <BasicRow field="소속">{user?.department?.name}</BasicRow>
            </RowGroup>
          </>
        )}
        {user?.type === "PROFESSOR" && (
          <RowGroup>
            <FileUploadRow
              field="서명 이미지"
              form={form}
              formKey="signFile"
              previousFile={user?.signFile}
            />
          </RowGroup>
        )}
        <RowGroup withBorderBottom={false}>
          <ButtonRow
            buttons={[
              <Button key="save" type="submit">
                저장하기
              </Button>,
            ]}
          />
        </RowGroup>
      </Stack>
    </form>
  );
}

export default UserInfoEditSection;
