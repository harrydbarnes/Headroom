import {common} from '../strings/common';
import {counts} from '../strings/format';
import {todayCopy} from '../strings/today';
import {HelpNote} from '../ui/components';
import {formatDate,formatDateTime,formatMonth,formatRange} from '../lib/dates';
import {counted} from '../strings/format';
import {budgetLedger} from '../lib/budgets';
import {pensionAnalysis} from '../lib/pensions';
import {categoryGroup,spendingParts} from '../lib/planning';
import {dayKey} from '../lib/workspace';
import React from 'react';
import {View,Text} from 'react-native';
import type {Banking} from '../services/useBanking';
import {useWorkspace} from '../state/hooks';
import {assess,monthTotals} from '../lib/finance';
import {effectivePlan,monthKey} from '../lib/workspace';
import {Button,Card,Copy,Field,Heading,Line,Money,Notice,Page} from '../ui/components';
import {AdaptiveColumns} from '../ui/AdaptiveColumns';
import {ExampleGuide} from '../ui/ExampleGuide';
import {HeadroomBar} from '../ui/HeadroomBar';
import type {Plan} from '../lib/finance';
import type {Workspace} from '../lib/workspace';
import {SetupProgress} from '../ui/SetupProgress';
import {DebtFields} from '../ui/DebtFields';
import {styles as s,useTheme} from '../ui/theme';
export function Today({navigate,banking}:{banking:Banking;navigate:(tab:string,month?:string)=>void}){
 const store=useWorkspace(),w=store.workspace,p=effectivePlan(w),r=assess(p),{colors:c}=useTheme(),totals=monthTotals(w.transactions,monthKey());
 const expired=banking.statusState==='verified'&&banking.connections.some(c=>Date.parse(c.expires)<=Date.now());
 const backlog=w.transactions.filter(t=>t.movement==='review').sort((a,b)=>a.date.localeCompare(b.date)),oldest=backlog[0]?.date.slice(0,7);
 const spending=spendingParts(w.transactions,w.ledger).filter(t=>t.date.startsWith(monthKey())).map(t=>({...t,category:categoryGroup(w.planning?.categories??[],t.category)}));
 const scoped=spending.filter(t=>['Essentials','Flexible'].includes(t.category)).reduce((sum,t)=>sum+t.amount,0),excluded=spending.filter(t=>!['Essentials','Flexible'].includes(t.category));
 if(w.onboardingStep<4)return <Page key={w.onboardingStep}><Heading>{todayCopy.makeRoomForWhatMatters}</Heading><Copy>{todayCopy.aFewAmountsGiveYouAFirst}</Copy><Copy small>{todayCopy.setupProgress(w.onboardingStep+1)}</Copy><SetupProgress step={w.onboardingStep} total={4}/>
  <Card title={todayCopy.setupTitles[w.onboardingStep]}>
   {w.onboardingStep===0&&<><Field label={todayCopy.monthlyHouseholdTakeHomeIncome} value={p.income} onChange={v=>store.patch({income:v})}/><Copy small>{todayCopy.useIncomeAfterText}</Copy></>}
   {w.onboardingStep===1&&<><Field label={todayCopy.essentialsIncludingMortLabel} value={p.essentials} onChange={v=>store.patch({essentials:v})}/><Field label={todayCopy.flexibleSpending} value={p.flexible} onChange={v=>store.patch({flexible:v})}/><Field label={todayCopy.annualBillsDividedByLabel} value={p.annualReserve} onChange={v=>store.patch({annualReserve:v,annualTotal:undefined})}/></>}
   {w.onboardingStep===2&&<><Field label={todayCopy.emergencyCashExcludingLabel} value={p.cash} onChange={v=>store.patch({cash:v})}/><DebtFields plan={p} onChange={debts=>store.patch({debts})}/><Copy small>{todayCopy.unknownLeaveThisStepForNowAnd}</Copy></>}
   {w.onboardingStep===3&&<><Line label={todayCopy.provisionalMonthlyHeadroom} value={<Money value={r.surplus}/>}/><Copy>{todayCopy.usesPlannedSpendingText}</Copy><Button title={todayCopy.reviewMonthlyBaseline} onPress={()=>navigate('Plan')}/></>}
   {w.onboardingStep<3&&<Button secondary title={todayCopy.skipThisSection} onPress={()=>store.change(x=>({...x,setupSkipped:[...new Set([...(x.setupSkipped??[]),x.onboardingStep])],onboardingStep:x.onboardingStep+1}))}/>}{w.onboardingStep===3&&<Copy small>{todayCopy.setupConfirmHelp(w.setupSkipped?.length?todayCopy.setupChecklist(w.setupSkipped.map(n=>common.setupSections[n].toLowerCase()).join(', ')):todayCopy.allSetupSectionsVisited)}</Copy>}<Button title={w.onboardingStep===3?todayCopy.openMyOverview:todayCopy.saveAndContinue} onPress={()=>store.change(x=>({...x,onboardingStep:Math.min(4,x.onboardingStep+1),setupSkipped:(x.setupSkipped??[]).filter(n=>n!==x.onboardingStep)}))}/>
   {w.onboardingStep>0&&<Button secondary title={todayCopy.previousStep} onPress={()=>store.change(x=>({...x,onboardingStep:x.onboardingStep-1}))}/>}</Card>
  <Button secondary title={todayCopy.tryExampleData} onPress={()=>store.setDemo(true)}/><Button secondary title={todayCopy.connectAccountsInstead} onPress={()=>navigate('Accounts')}/>
 </Page>;
 return <Page><ExampleGuide navigate={navigate}/><TodayHero plan={p} workspace={w}/>
  {!!w.setupSkipped?.length&&<Card title={todayCopy.finishYourSetupChecks}><Copy>{todayCopy.setupSkippedHelp(w.setupSkipped.map(n=>common.setupSections[n]).join(', '))}</Copy><Button secondary title={todayCopy.reviewSetupChecks} onPress={()=>navigate('Plan')}/></Card>}
  {!w.planConfirmedAt&&<Button title={todayCopy.confirmMonthlyBaseline} onPress={()=>navigate('Plan')}/>}
  {!!w.planning?.budgets.length&&<Card title={todayCopy.yourPeriodBudgets}>{w.planning.budgets.slice(0,3).map(b=>{const r=budgetLedger(w,b,dayKey());return r.current?<View key={b.id}><Line label={b.name+todayCopy.remaining} value={<Money value={r.current.remaining}/>}/><Copy small>{todayCopy.budgetPeriodStatus(formatRange(r.current.start,r.current.end),counts.day(r.daysLeft),counts.transaction(r.unreviewed))}</Copy></View>:null;})}<Copy small>{todayCopy.limitsOverlapDoText}</Copy><Button secondary title={todayCopy.reviewBudgets} onPress={()=>navigate('Plan')}/></Card>}
  {w.planning?.pensions.some(s=>{const a=pensionAnalysis(s,w,dayKey());return !!a.full&&a.full.additionalEmployer>0;})&&<Card title={todayCopy.reviewYourPensionMatch}><Copy>{todayCopy.confirmedSchemeTermsDetail}</Copy><Button secondary title={todayCopy.comparePensionContributions} onPress={()=>navigate('Plan')}/></Card>}
  <AdaptiveColumns>  <Card title={todayCopy.yourNextAction}><Copy>{backlog.length?todayCopy.reviewBacklog(counts.transaction(backlog.length),backlog.length===1?"needs":"need",oldest?formatMonth(oldest):"not recorded"):expired?todayCopy.bankPermissionExpiredText:!w.planConfirmedAt?todayCopy.completeConfirmSavedText:r.surplus<0?todayCopy.planSpendsMoreText:r.debt>0?todayCopy.reviewDebtBalancesText:todayCopy.giveRemainingMoneyText}</Copy><Button title={backlog.length?todayCopy.reviewOldestMonth:expired?todayCopy.reconnectMyBank:todayCopy.openMyPlan} onPress={()=>navigate(backlog.length?'Activity':expired?'Accounts':'Plan',oldest)}/><Line label={todayCopy.emergencyCashGap} value={<Money value={r.emergencyGap}/>}/><Line label={todayCopy.goalShortfallPerMonth} value={<Money value={r.goalShortfall}/>}/></Card>
  <Card title={todayCopy.dataAndCompleteness}><Copy>{todayCopy.lastRefreshStatus(w.lastSync?formatDateTime(w.lastSync):todayCopy.noCompleteImportRecorded)}</Copy><Copy small>{todayCopy.lastRefreshAttempt(w.syncReceipt?formatDateTime(w.syncReceipt.attemptedAt)+" · "+(w.syncReceipt.status==='complete'?todayCopy.complete:todayCopy.someDataMayBeMissing):todayCopy.noneRecorded)}</Copy><Button secondary title={todayCopy.checkBankAccess} onPress={()=>navigate('Accounts')}/><Copy>{todayCopy.monthReviewStatus(counts.pastMonth(p.monthsReviewed),counts.transaction(totals.unreviewed))}</Copy><Copy small>{todayCopy.confirmEachMonthDetail}</Copy><Button secondary title={todayCopy.checkCompleteMonths} onPress={()=>navigate('Activity')}/></Card>
</AdaptiveColumns>
  <AdaptiveColumns>  <Card variant="plain" title={todayCopy.financialWellbeing}><Heading>{w.planConfirmedAt&&r.score!==null?todayCopy.scoreValue(r.score):todayCopy.moreEvidenceNeeded}</Heading><Copy small>{w.planConfirmedAt&&r.score!==null?todayCopy.scoreBreakdown(r.components.cash,r.components.margin,r.components.debt):todayCopy.confirmABaselineAllText}</Copy><HelpNote summary={todayCopy.scoreDataSummary}><Copy small>{todayCopy.scoreEvidenceHelp(w.planConfirmedAt?todayCopy.confirmedDetail:todayCopy.needsConfirmation,p.coverageConfirmed?todayCopy.confirmedDetail:todayCopy.needed,p.monthsReviewed)}</Copy></HelpNote><Copy small>{todayCopy.aGuideBasedOnTheDataYou}</Copy></Card>
  <Card variant="plain" title={todayCopy.yourMonthlyCheckIn}><Line label={todayCopy.reviewedEssentialsFlexiLabel} value={<Money value={scoped}/>}/><Line label={todayCopy.plannedEssentialsFlexible} value={<Money value={p.essentials+p.flexible}/>}/><HelpNote summary={todayCopy.outsideTheseCategoriesSummary}><Copy small>{counts.reviewedSpendingEntry(excluded.length)}{todayCopy.outsideTheseCategoriesDetail}<Money value={excluded.reduce((sum,t)=>sum+t.amount,0)}/>{todayCopy.theyExcludedComparisonDetail}</Copy></HelpNote></Card>
</AdaptiveColumns>
  <Button secondary title={store.demo?todayCopy.showYourData:todayCopy.tryExampleData} onPress={()=>store.setDemo(!store.demo)}/>
 </Page>;
}

function TodayHero({plan, workspace}: {plan: Plan; workspace: Workspace}) {
  const {colors: c} = useTheme();
  const result = assess(plan);
  return (
    <View style={[s.hero, {backgroundColor: c.card}]}>
      <Copy strong>{todayCopy.monthlyHeadroom}</Copy>
      <Copy small>{todayCopy.whatSLeftEachMonthAfterPlanned}</Copy>
      {plan.income > 0 && <Money textStyle={[s.number, {color: c.text}]} value={result.surplus}/>}
      <HeadroomBar plan={plan}/>
      <Line label={todayCopy.monthlyIncome} value={<Money value={plan.income}/>}/>
      <Line label={todayCopy.spendingAndReserves} value={<Money value={result.committed}/>}/>
      <Copy>{todayCopy.headroomContext(plan.income > 0 ? result.comfort : todayCopy.addYourIncomeToSeeYourPlan)}</Copy>
      <Copy small>{todayCopy.cashBalanceLimit(workspace.planConfirmedAt ? todayCopy.baselineConfirmed + formatDateTime(workspace.planConfirmedAt) : todayCopy.provisionalConfirmBaselText)}</Copy>
    </View>
  );
}
