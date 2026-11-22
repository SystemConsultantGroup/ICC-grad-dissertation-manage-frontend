import { RowGroup } from "@/components/common/rows";
import { Box, Group, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

export interface PhaseReadyAlertRowProps {
  title: string;
  start: string;
  end: string;
}

export default function PhaseReadyAlertRow({ title /* start, end */ }: PhaseReadyAlertRowProps) {
  return (
    <RowGroup withBorderBottom={false}>
      <Box c="red">
        <Group>
          <IconAlertTriangle />
          <Text>{title} 기간이 아닙니다.</Text>
          {/*<Text>
            (기간: {start} ~ {end})
            </Text>*/}
        </Group>
      </Box>
    </RowGroup>
  );
}
