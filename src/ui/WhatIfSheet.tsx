import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { formatDate } from '../lib/dates';
import { headroomAt, type WhatIfDelta } from '../lib/headroomAt';
import { dayKey, type Workspace } from '../lib/workspace';
import { todayCopy } from '../strings/today';
import { Button, Copy, DateField, Field, Line, Money, Sheet } from './components';
import { TextButton } from './TextButton';

export function WhatIfSheet({
  visible,
  onClose,
  workspace,
  targetDate,
}: {
  visible: boolean;
  onClose: () => void;
  workspace: Workspace;
  targetDate: string;
}) {
  const today = dayKey();
  const [oneOffSpend, setOneOffSpend] = useState(0);
  const [oneOffDate, setOneOffDate] = useState(targetDate >= today ? targetDate : today);
  const [monthlyExtraSave, setMonthlyExtraSave] = useState(0);
  const [monthlyExtraInvest, setMonthlyExtraInvest] = useState(0);

  const delta: WhatIfDelta = useMemo(
    () => ({
      oneOffSpend,
      oneOffDate,
      monthlyExtraSave,
      monthlyExtraInvest,
    }),
    [oneOffSpend, oneOffDate, monthlyExtraSave, monthlyExtraInvest],
  );

  const baseline = useMemo(
    () => (visible ? headroomAt(workspace, targetDate, today) : null),
    [visible, workspace, targetDate, today],
  );
  const simulated = useMemo(
    () => (visible ? headroomAt(workspace, targetDate, today, delta) : null),
    [visible, workspace, targetDate, today, delta],
  );

  const reset = () => {
    setOneOffSpend(0);
    setOneOffDate(targetDate >= today ? targetDate : today);
    setMonthlyExtraSave(0);
    setMonthlyExtraInvest(0);
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={todayCopy.whatIfTitle}>
      {visible && baseline && simulated && (
        <View style={{ gap: 12 }}>
          <Copy small>{todayCopy.whatIfIntro}</Copy>
          <Field
            label={todayCopy.whatIfOneOffLabel}
            value={oneOffSpend}
            onChange={setOneOffSpend}
          />
          <DateField
            label={todayCopy.whatIfDateLabel}
            value={oneOffDate}
            onChange={setOneOffDate}
          />
          <Field
            label={todayCopy.whatIfMonthlySaveLabel}
            value={monthlyExtraSave}
            onChange={setMonthlyExtraSave}
          />
          <Field
            label={todayCopy.whatIfMonthlyInvestLabel}
            value={monthlyExtraInvest}
            onChange={setMonthlyExtraInvest}
          />
          <Line label={todayCopy.whatIfBefore} value={<Money value={baseline.safeToSpend} />} />
          <Line label={todayCopy.whatIfAfter} value={<Money value={simulated.safeToSpend} />} />
          {simulated.lowestCashBeforeTarget !== null && (
            <Line
              label={todayCopy.whatIfLowestAfter}
              value={<Money value={simulated.lowestCashBeforeTarget} />}
            />
          )}
          <Copy small>{formatDate(targetDate)}</Copy>
          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
            <TextButton title={todayCopy.clearWhatIf} onPress={reset} />
            <Button secondary title={todayCopy.cancel} onPress={onClose} />
          </View>
        </View>
      )}
    </Sheet>
  );
}
