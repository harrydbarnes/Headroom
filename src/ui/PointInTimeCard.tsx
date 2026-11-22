import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { formatDate } from '../lib/dates';
import { defaultCustomSplit, type AllocationMode } from '../lib/finance';
import { headroomAt, quickTargetDates } from '../lib/headroomAt';
import { dayKey } from '../lib/workspace';
import { useWorkspace } from '../state/hooks';
import { todayCopy } from '../strings/today';
import { Button, Card, Copy, DateField, Field, Line, Money, Notice } from './components';
import { TextButton } from './TextButton';
import { useTheme } from './theme';
import { WhatIfSheet } from './WhatIfSheet';

const chipLabels = {
  today: todayCopy.chipToday,
  payday: todayCopy.chipPayday,
  monthEnd: todayCopy.chipMonthEnd,
  threeMonths: todayCopy.chipThreeMonths,
  oneYear: todayCopy.chipOneYear,
} as const;

export function PointInTimeCard({ navigate }: { navigate: (tab: string, month?: string) => void }) {
  const store = useWorkspace();
  const w = store.workspace;
  const { colors: c } = useTheme();
  const today = dayKey();
  const paydayDay = store.data.preferences.paydayDay ?? 25;
  const chips = useMemo(() => quickTargetDates(today, paydayDay), [today, paydayDay]);

  const [targetDate, setTargetDate] = useState(today);
  const [customDateOpen, setCustomDateOpen] = useState(false);
  const [splitEditorOpen, setSplitEditorOpen] = useState(false);
  const [whatIfOpen, setWhatIfOpen] = useState(false);

  const currentSplit = w.plan.customSplit ?? defaultCustomSplit;
  const [draftSave, setDraftSave] = useState(currentSplit.save);
  const [draftInvest, setDraftInvest] = useState(currentSplit.invest);
  const [draftSpend, setDraftSpend] = useState(currentSplit.spend);

  const result = useMemo(() => headroomAt(w, targetDate, today), [w, targetDate, today]);
  const splitSum = draftSave + draftInvest + draftSpend;

  const setMode = (mode: AllocationMode) => {
    store.patch({
      allocationMode: mode,
      ...(mode === 'custom' && !w.plan.customSplit ? { customSplit: defaultCustomSplit } : {}),
    });
  };

  const openSplitEditor = () => {
    const cs = w.plan.customSplit ?? defaultCustomSplit;
    setDraftSave(cs.save);
    setDraftInvest(cs.invest);
    setDraftSpend(cs.spend);
    setSplitEditorOpen(true);
  };

  const saveSplit = () => {
    if (splitSum !== 100) return;
    if (
      store.patch({
        allocationMode: 'custom',
        customSplit: { save: draftSave, invest: draftInvest, spend: draftSpend },
      })
    ) {
      setSplitEditorOpen(false);
    }
  };

  return (
    <Card title={todayCopy.pointInTimeTitle}>
      <Copy small>
        {result.mode === 'live'
          ? todayCopy.pointInTimeLive(formatDate(result.targetDate))
          : todayCopy.pointInTimePlanned(formatDate(result.targetDate))}
      </Copy>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {chips.map((chip) => {
          const selected = !customDateOpen && targetDate === chip.date;
          return (
            <Pressable
              key={chip.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => {
                setCustomDateOpen(false);
                setTargetDate(chip.date);
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 16,
                backgroundColor: selected ? c.primaryContainer : c.container,
                borderWidth: selected ? 1 : 0,
                borderColor: c.primary,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: selected ? '700' : '500',
                  color: selected ? c.onPrimaryContainer : c.text,
                }}
              >
                {chipLabels[chip.id]}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: customDateOpen }}
          onPress={() => setCustomDateOpen((v) => !v)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 16,
            backgroundColor: customDateOpen ? c.primaryContainer : c.container,
            borderWidth: customDateOpen ? 1 : 0,
            borderColor: c.primary,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: customDateOpen ? '700' : '500',
              color: customDateOpen ? c.onPrimaryContainer : c.text,
            }}
          >
            {todayCopy.chooseDate}
          </Text>
        </Pressable>
      </View>

      {customDateOpen && (
        <DateField label={todayCopy.targetDateLabel} value={targetDate} onChange={setTargetDate} />
      )}

      <Line label={todayCopy.spendFreely} value={<Money value={result.safeToSpend} />} />
      <Line label={todayCopy.canSave} value={<Money value={result.canSave} />} />
      <Line label={todayCopy.canInvest} value={<Money value={result.canInvest} />} />

      {result.mode === 'live' && result.lowestCashBeforeTarget !== null && (
        <>
          <Line
            label={todayCopy.lowestCashFloor}
            value={<Money value={result.lowestCashBeforeTarget} />}
          />
          {result.upcomingBillsTotal > 0 && (
            <Line
              label={todayCopy.upcomingBills}
              value={<Money value={result.upcomingBillsTotal} />}
            />
          )}
        </>
      )}

      {result.mode === 'planned' && (
        <View style={{ gap: 6 }}>
          <Copy small>{todayCopy.addBalancePrompt}</Copy>
          <TextButton title={todayCopy.addBalanceAction} onPress={() => navigate('Accounts')} />
        </View>
      )}

      <View style={{ gap: 8 }}>
        <Copy small>{todayCopy.splitModeLabel}</Copy>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {(['custom', 'guided'] as const).map((mode) => {
            const selected = result.allocationMode === mode;
            return (
              <Pressable
                key={mode}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setMode(mode)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 16,
                  backgroundColor: selected ? c.primaryContainer : c.container,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: selected ? '700' : '500',
                    color: selected ? c.onPrimaryContainer : c.text,
                  }}
                >
                  {mode === 'custom' ? todayCopy.splitCustom : todayCopy.splitGuided}
                </Text>
              </Pressable>
            );
          })}
          {result.allocationMode === 'custom' && (
            <TextButton
              title={todayCopy.editSplit}
              onPress={() => (splitEditorOpen ? setSplitEditorOpen(false) : openSplitEditor())}
            />
          )}
        </View>
      </View>

      {splitEditorOpen && (
        <View style={{ gap: 10 }}>
          <Field
            money={false}
            integer
            min={0}
            max={100}
            label={todayCopy.savePercentLabel}
            value={draftSave}
            onChange={setDraftSave}
          />
          <Field
            money={false}
            integer
            min={0}
            max={100}
            label={todayCopy.investPercentLabel}
            value={draftInvest}
            onChange={setDraftInvest}
          />
          <Field
            money={false}
            integer
            min={0}
            max={100}
            label={todayCopy.spendPercentLabel}
            value={draftSpend}
            onChange={setDraftSpend}
          />
          {splitSum !== 100 ? (
            <Notice error>{todayCopy.splitTotalHint(splitSum)}</Notice>
          ) : (
            <Copy small>{todayCopy.splitTotalHint(splitSum)}</Copy>
          )}
          <Button title={todayCopy.saveSplit} disabled={splitSum !== 100} onPress={saveSplit} />
        </View>
      )}

      <Button secondary title={todayCopy.tryWhatIf} onPress={() => setWhatIfOpen(true)} />
      <WhatIfSheet
        visible={whatIfOpen}
        onClose={() => setWhatIfOpen(false)}
        workspace={w}
        targetDate={result.targetDate}
      />
    </Card>
  );
}
