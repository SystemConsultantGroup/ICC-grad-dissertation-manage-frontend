"use client";

import { Section } from "@/components/common/Section";
import { Stack } from "@mantine/core";
import { TitleRow } from "@/components/common/rows";
import usePhases from "@/api/SWR/usePhases";
import { useEffect } from "react";
import PhaseEditFormRow from "./PhaseEditFormRow";

function SystemSection() {
  const { data: PhasesData, isLoading: isPhasesLoading } = usePhases();

  useEffect(() => {
    console.log(PhasesData);
  });

  return (
    <Section>
      <Stack>
        {/* <Stack gap={0}>
          <TitleRow title="시스템 현재 시간" />
          <Stack style={{ padding: 20 }}>
            <Text size="lg" c="dimmed">
              <Clock />
            </Text>
          </Stack>
        </Stack> */}
        <Stack gap={0}>
          <TitleRow
            title="시스템 일정 설정"
            subString="시스템 일정 시작일시와 종료일시를 입력해주세요."
          />
          {!isPhasesLoading &&
            PhasesData?.phases.map((phase, index) => (
              <PhaseEditFormRow
                key={index}
                id={phase.id}
                title={phase.title}
                start={phase.start}
                end={phase.end}
              />
            ))}
        </Stack>
      </Stack>
    </Section>
  );
}

export default SystemSection;
