"use client";

import { Button, Group, PasswordInput, Stack } from "@mantine/core";
import BasicRow from "@/components/common/rows/BasicRow/BasicRow";
import ButtonRow from "@/components/common/rows/ButtonRow/ButtonRow";
import { RowGroup } from "@/components/common/rows";
import { useAuth } from "@/components/common/AuthProvider";
import { useForm } from "@mantine/form";
import { Department } from "@/api/_types/department";
import { useState } from "react";
import { ClientAxios } from "@/api/ClientAxios";
import { API_ROUTES } from "@/api/apiRoute";
import { showNotificationSuccess } from "@/components/common/Notifications";

interface AdminInfoEditFormInputs {
  password: string;
  email?: string;
  phone?: string;
  department?: Omit<Department, "userCount">;
}

function AdminInfoEditSection() {
  const { user } = useAuth();
  const [isPwEditing, setIsPwEditing] = useState(false);

  const { onSubmit, getInputProps, setFieldValue } = useForm<AdminInfoEditFormInputs>({
    initialValues: {
      password: "",
    },
    validate: {
      password: (value, values) =>
        isPwEditing && !values.password ? "비밀번호를 입력하거나 수정을 취소해주세요." : null,
    },
  });

  const handleSubmit = async (values: AdminInfoEditFormInputs) => {
    try {
      const body = {
        password: isPwEditing ? values.password : undefined,
      };
      await ClientAxios.put(API_ROUTES.user.put(), body);
      showNotificationSuccess({ message: "관리자 정보가 수정되었습니다." });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={onSubmit(handleSubmit)}>
      <Stack gap={0}>
        <RowGroup>
          <BasicRow field="아이디">{user?.loginId}</BasicRow>
        </RowGroup>
        <RowGroup>
          <BasicRow field="비밀번호">
            <Group>
              <PasswordInput {...getInputProps("password")} disabled={!isPwEditing} />
              {isPwEditing ? (
                <Group>
                  <Button
                    onClick={() => {
                      setFieldValue("password", "");
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

export default AdminInfoEditSection;
