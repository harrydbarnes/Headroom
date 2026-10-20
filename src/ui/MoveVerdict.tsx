import React from 'react';
import {View} from 'react-native';
import {houseMove} from '../lib/calculators/houseMove';
import {moveBudget, type Workspace} from '../lib/workspace';
import {displayMessage} from '../strings/messages';
import {moveCopy} from '../strings/move';
import {Copy, Heading, Line, Money} from './components';
import {useTheme} from './theme';

/** Present the calculator's existing warning order, with the evidence that drives it. */
export function MoveVerdict({workspace}: {workspace: Workspace}) {
  const {colors: c, hideAmounts} = useTheme();
  const move = workspace.move;
  const input = move.input;
  const result = houseMove(input);
  const budget = moveBudget(workspace);
  const confirmed = input.purchase > 0 && move.confirmed;
  const message = !confirmed ? moveCopy.verdictPending
    : result.warnings[0] ? displayMessage(result.warnings[0])
    : result.exchange.gap > 0 ? moveCopy.exchangeConstraint
    : budget === null ? moveCopy.housingConstraint
    : budget < 0 ? moveCopy.spendingConstraint : moveCopy.noConstraint;
  const loanWarning = result.warnings[0]?.startsWith('Mortgage exceeds') || result.warnings[0]?.startsWith('Loan is');
  const cashWarning = result.warnings[0]?.startsWith('Cash');
  const evidence: {label: string; value: number; percent?: boolean}[] = result.warnings[0]?.includes('LTV') ? [
    {label: moveCopy.lTV, value: result.ltv ?? 0, percent: true},
    {label: moveCopy.preferredLTVCeiling, value: input.ltvCeiling, percent: true},
    {label: moveCopy.mortgage, value: result.loan},
  ] : result.warnings[0]?.startsWith('Loan is') ? [
    {label: moveCopy.mortgage, value: result.loan},
    {label: moveCopy.purchasePrice, value: input.purchase},
  ] : loanWarning ? [
    {label: moveCopy.mortgage, value: result.loan},
    {label: moveCopy.indicativeBorrowingLimit, value: input.borrowingLimit},
    {label: moveCopy.monthlyMortgage, value: result.payment},
  ] : cashWarning ? [
    {label: moveCopy.cashAfterCompletion, value: result.cashAfterCompletion},
    {label: moveCopy.cashToRetain, value: input.reserve},
    {label: moveCopy.exchangeCashGap, value: result.exchange.gap},
  ] : result.exchange.gap > 0 ? [
    {label: moveCopy.exchangeDepositLabel, value: result.exchange.deposit},
    {label: moveCopy.savingsAfterEarlyCosts, value: result.exchange.savingsRemaining},
    {label: moveCopy.exchangeCashGap, value: result.exchange.gap},
  ] : [
    {label: moveCopy.monthlyMortgage, value: result.payment},
    {label: moveCopy.cashAfterCompletion, value: result.cashAfterCompletion},
    ...(budget !== null ? [{label: moveCopy.monthlyHeadroomAfterLabel, value: budget}] : []),
  ];
  return (
    <View style={{backgroundColor: c.primaryContainer, borderRadius: 20, padding: 16, gap: 12}}>
      <Heading>{moveCopy.mainConstraint}</Heading>
      <Copy>{message}</Copy>
      {confirmed && evidence.map(item => <Line key={item.label} label={item.label}
        value={item.percent && !hideAmounts ? <Copy>{moveCopy.percentValue(item.value.toFixed(1))}</Copy> : <Money value={item.value}/>}/>)}
    </View>
  );
}
