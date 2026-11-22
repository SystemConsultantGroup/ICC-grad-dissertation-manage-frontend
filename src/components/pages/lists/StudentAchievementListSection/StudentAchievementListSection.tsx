"use client";

import { Button, Group, Skeleton, Stack } from "@mantine/core";
import { Table } from "@/components/common/Table";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PAGE_SIZES } from "@/constants/pageSize";
import {
  ACHIEVEMENT_AUTHOR_TYPE_LOOKUP_TABLE,
  ACHIEVEMENT_TYPE_LOOKUP_TABLE,
} from "@/api/_types/achievement";
import useAchievements from "@/api/SWR/useAchievements";
import { STUDENT_ACHIEVEMENT_TABLE_HEADERS } from "../_constants/table";

export function formatISSN(issn?: string) {
  if (issn) {
    const firstFourDigits = issn.substring(0, 4);
    const lastFourDigits = issn.substring(4, 8);
    return `${firstFourDigits}-${lastFourDigits}`;
  }
  return "";
}

function StudentAchievementListSection() {
  const { push } = useRouter();
  const [pageSize, _setPageSize] = useState<string | null>(String(PAGE_SIZES[3]));
  const [pageNumber, _setPageNumber] = useState(1);
  const pageSizeNumber = Number(pageSize);

  const { data: achievements, isLoading } = useAchievements({
    pageNumber,
    pageSize: pageSizeNumber,
  });

  return (
    <Stack>
      <Group justify="right">
        <Button size="xs" leftSection={<IconPlus />} component={Link} href="achievement/register">
          실적 등록
        </Button>
      </Group>
      <Table headers={STUDENT_ACHIEVEMENT_TABLE_HEADERS}>
        {isLoading && <Skeleton />}
        {achievements?.map((achievement, index) => (
          <Table.Row
            key={achievement.id}
            onClick={() => {
              push(`achievement/${achievement.id}`);
            }}
          >
            <Table.Data>{index + 1 + (pageNumber - 1) * pageSizeNumber}</Table.Data>
            <Table.Data>{achievement.paperTitle}</Table.Data>
            <Table.Data>{ACHIEVEMENT_TYPE_LOOKUP_TABLE[achievement.performance]}</Table.Data>
            <Table.Data>{achievement.journalName}</Table.Data>
            <Table.Data>{formatISSN(achievement.ISSN)}</Table.Data>
            <Table.Data>
              {new Date(achievement.publicationDate).toLocaleDateString("ko-KR")}
            </Table.Data>
            <Table.Data>{ACHIEVEMENT_AUTHOR_TYPE_LOOKUP_TABLE[achievement.authorType]}</Table.Data>
            <Table.Data>{achievement.authorNumbers}</Table.Data>
          </Table.Row>
        ))}
      </Table>
    </Stack>
  );
}

export default StudentAchievementListSection;
