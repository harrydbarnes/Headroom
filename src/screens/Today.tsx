import {TextButton} from '../ui/TextButton';
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
import {Disclosure} from '../ui/Disclosure';
import {HeadroomBar} from '../ui/HeadroomBar';
import type {Plan} from '../lib/finance';
import type {Workspace} from '../lib/workspace';
import {SetupProgress} from '../ui/SetupProgress';
import {DebtFields} from '../ui/DebtFields';
import {styles as s,useTheme} from '../ui/theme';
export function Today({navigate,banking}:{banking:Banking;navigate:(tab:string,month?:string)=>void}){
 const store=useWorkspace(),w=store.workspace,p=effectivePlan(w),r=assess(p),{colors:c}=useTheme(),totals=monthTotals(w.transactions,monthKey());
 if(w.onboardingStep<4)return <Page key={w.onboardingStep}><Heading>{todayCopy.makeRoomForWhatMatters}</Heading><Copy>{todayCopy.aFewAmountsGiveYouAFirst}</Copy><Copy small>{todayCopy.setupProgress(w.onboardingStep+1)}</Copy><SetupProgress step={w.onboardingStep} total={4}/>
  <Card title={todayCopy.setupTitles[w.onboardingStep]}>
   {w.onboardingStep===0&&<><Field label={todayCopy.monthlyHouseholdTakeHomeIncome} value={p.income} onChange={v=>store.patch({income:v})}/><Copy small>{todayCopy.useIncomeAfterText}</Copy></>}
   {w.onboardingStep===1&&<><Field label={todayCopy.essentialsIncludingMortLabel} value={p.essentials} onChange={v=>store.patch({essentials:v})}/><Field label={todayCopy.flexibleSpending} value={p.flexible} onChange={v=>store.patch({flexible:v})}/><Field label={todayCopy.annualBillsDividedByLabel} value={p.annualReserve} onChange={v=>store.patch({annualReserve:v,annualTotal:undefined})}/></>}
   {w.onboardingStep===2&&<><Field label={todayCopy.emergencyCashExcludingLabel} value={p.cash} onChange={v=>store.patch({cash:v})}/><DebtFields plan={p} onChange={debts=>store.patch({debts})}/><Copy small>{todayCopy.unknownLeaveThisStepForNowAnd}</Copy></>}
   {w.onboardingStep===3&&<><Line label={todayCopy.provisionalMonthlyHeadroom} value={<Money value={r.surplus}/>}/><Copy>{todayCopy.usesPlannedSpendingText}</Copy><TextButton title={todayCopy.reviewMonthlyBaseline} onPress={()=>navigate('Plan')}/></>}
   {w.onboardingStep<3&&<TextButton title={todayCopy.skipThisSection} onPress={()=>store.change(x=>({...x,setupSkipped:[...new Set([...(x.setupSkipped??[]),x.onboardingStep])],onboardingStep:x.onboardingStep+1}))}/>}{w.onboardingStep===3&&<Copy small>{todayCopy.setupConfirmHelp(w.setupSkipped?.length?todayCopy.setupChecklist(w.setupSkipped.map(n=>common.setupSections[n].toLowerCase()).join(', ')):todayCopy.allSetupSectionsVisited)}</Copy>}<Button title={w.onboardingStep===3?todayCopy.openMyOverview:todayCopy.saveAndContinue} onPress={()=>store.change(x=>({...x,onboardingStep:Math.min(4,x.onboardingStep+1),setupSkipped:(x.setupSkipped??[]).filter(n=>n!==x.onboardingStep)}))}/>
   {w.onboardingStep>0&&<TextButton title={todayCopy.previousStep} onPress={()=>store.change(x=>({...x,onboardingStep:x.onboardingStep-1}))}/>}</Card>
  <Button secondary title={todayCopy.tryExampleData} onPress={()=>store.setDemo(true)}/><Button secondary title={todayCopy.connectAccountsInstead} onPress={()=>navigate('Accounts')}/>
 </Page>;
 return <TodayOverview navigate={navigate} banking={banking}/>;
}

function TodayOverview({
  navigate,
  banking,
}: {
  navigate: (tab: string, month?: string) => void;
  banking: Banking;
}) {
  const store = useWorkspace();
  const w = store.workspace;
  const p = effectivePlan(w);
  const r = assess(p);
  const backlog = w.transactions
    .filter((t) => t.movement === 'review')
    .sort((a, b) => a.date.localeCompare(b.date));
  const oldest = backlog[0]?.date.slice(0, 7);
  const expired =
    banking.statusState === 'verified' &&
    banking.connections.some((connection) => Date.parse(connection.expires) <= Date.now());
  const needsAttention = backlog.length > 0 || expired || !!w.setupSkipped?.length;
  const message = backlog.length
    ? todayCopy.reviewBacklog(
        backlog.length,
        oldest ? formatMonth(oldest) : todayCopy.noneRecorded,
      )
    : expired
      ? todayCopy.bankPermissionExpiredText
      : !w.planConfirmedAt
        ? todayCopy.completeConfirmSavedText
        : r.surplus < 0
          ? todayCopy.planSpendsMoreText
          : r.debt > 0
            ? todayCopy.reviewDebtBalancesText
            : todayCopy.giveRemainingMoneyText;
  return (
    <Page>
      <TodayHero plan={p} workspace={w} />
      {needsAttention && (
        <TodayAttention
          backlog={backlog.length}
          expired={expired}
          skipped={w.setupSkipped?.length ?? 0}
          navigate={navigate}
          oldest={oldest}
        />
      )}
      <TodayNextAction
        message={message}
        title={
          backlog.length
            ? todayCopy.reviewOldestMonth
            : expired
              ? todayCopy.reconnectMyBank
              : todayCopy.openMyPlan
        }
        onPress={() =>
          navigate(backlog.length ? 'Activity' : expired ? 'Accounts' : 'Plan', oldest)
        }
      />
      <Disclosure title={todayCopy.moreDetail}>
        <TodayDetails navigate={navigate} />
      </Disclosure>
    </Page>
  );
}

function TodayAttention({
  backlog,
  expired,
  skipped,
  navigate,
  oldest,
}: {
  backlog: number;
  expired: boolean;
  skipped: number;
  navigate: (tab: string, month?: string) => void;
  oldest?: string;
}) {
  return (
    <Disclosure
      title={todayCopy.needsAttention}
      summary={todayCopy.attentionCount(
        Number(backlog > 0) + Number(expired) + Number(skipped > 0),
      )}
    >
      {backlog > 0 && (
        <Button
          secondary
          title={todayCopy.reviewOldestMonth}
          onPress={() => navigate('Activity', oldest)}
        />
      )}
      {expired && (
        <>
          <Copy small>{todayCopy.bankPermissionExpiredText}</Copy>
          <Button
            secondary
            title={todayCopy.reconnectMyBank}
            onPress={() => navigate('Accounts')}
          />
        </>
      )}
      {skipped > 0 && (
        <Button secondary title={todayCopy.reviewSetupChecks} onPress={() => navigate('Plan')} />
      )}
    </Disclosure>
  );
}

function TodayNextAction({
  message,
  title,
  onPress,
}: {
  message: string;
  title: string;
  onPress: () => void;
}) {
  const { colors: c } = useTheme();
  return (
    <View style={{ padding: 16, gap: 8, borderRadius: 20, backgroundColor: c.primaryContainer }}>
      <Heading>{todayCopy.yourNextAction}</Heading>
      <Copy>{message}</Copy>
      <Button title={title} onPress={onPress} />
    </View>
  );
}

function TodayDetails({ navigate }: { navigate: (tab: string, month?: string) => void }) {
  const store = useWorkspace(),
    w = store.workspace,
    p = effectivePlan(w),
    r = assess(p),
    totals = monthTotals(w.transactions, monthKey());
  const spending = spendingParts(w.transactions, w.ledger)
    .filter((t) => t.date.startsWith(monthKey()))
    .map((t) => ({ ...t, category: categoryGroup(w.planning?.categories ?? [], t.category) }));
  const scoped = spending
    .filter((t) => ['Essentials', 'Flexible'].includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);
  const excluded = spending.filter((t) => !['Essentials', 'Flexible'].includes(t.category));
  return (
    <View style={{ gap: 24 }}>
      <ExampleGuide navigate={navigate} />
      <Card title={todayCopy.monthlyHeadroom}>
        <Copy small>{todayCopy.whatSLeftEachMonthAfterPlanned}</Copy>
        <Line label={todayCopy.monthlyIncome} value={<Money value={p.income} />} />
        <Line label={todayCopy.spendingAndReserves} value={<Money value={r.committed} />} />
        <Copy>
          {todayCopy.headroomContext(
            p.income > 0 ? r.comfort : todayCopy.addYourIncomeToSeeYourPlan,
          )}
        </Copy>
        <Copy small>
          {todayCopy.cashBalanceLimit(
            w.planConfirmedAt
              ? todayCopy.baselineConfirmed + formatDateTime(w.planConfirmedAt)
              : todayCopy.provisionalConfirmBaselText,
          )}
        </Copy>
        <Line label={todayCopy.emergencyCashGap} value={<Money value={r.emergencyGap} />} />
        <Line label={todayCopy.goalShortfallPerMonth} value={<Money value={r.goalShortfall} />} />
        {!w.planConfirmedAt && (
          <Button
            secondary
            title={todayCopy.confirmMonthlyBaseline}
            onPress={() => navigate('Plan')}
          />
        )}
      </Card>
      {!!w.setupSkipped?.length && (
        <Card title={todayCopy.finishYourSetupChecks}>
          <Copy>
            {todayCopy.setupSkippedHelp(
              w.setupSkipped.map((n) => common.setupSections[n]).join(', '),
            )}
          </Copy>
          <Button secondary title={todayCopy.reviewSetupChecks} onPress={() => navigate('Plan')} />
        </Card>
      )}
      {!!w.planning?.budgets.length && (
        <Card title={todayCopy.yourPeriodBudgets}>
          {w.planning.budgets.slice(0, 3).map((b) => {
            const r = budgetLedger(w, b, dayKey());
            return r.current ? (
              <View key={b.id}>
                <Line
                  label={b.name + todayCopy.remaining}
                  value={<Money value={r.current.remaining} />}
                />
                <Copy small>
                  {todayCopy.budgetPeriodStatus(
                    formatRange(r.current.start, r.current.end),
                    counts.day(r.daysLeft),
                    counts.transaction(r.unreviewed),
                  )}
                </Copy>
              </View>
            ) : null;
          })}
          <Copy small>{todayCopy.limitsOverlapDoText}</Copy>
          <Button secondary title={todayCopy.reviewBudgets} onPress={() => navigate('Plan')} />
        </Card>
      )}
      {w.planning?.pensions.some((s) => {
        const a = pensionAnalysis(s, w, dayKey());
        return !!a.full && a.full.additionalEmployer > 0;
      }) && (
        <Card title={todayCopy.reviewYourPensionMatch}>
          <Copy>{todayCopy.confirmedSchemeTermsDetail}</Copy>
          <Button
            secondary
            title={todayCopy.comparePensionContributions}
            onPress={() => navigate('Plan')}
          />
        </Card>
      )}
      <Card title={todayCopy.dataAndCompleteness}>
        <Copy>
          {todayCopy.lastRefreshStatus(
            w.lastSync ? formatDateTime(w.lastSync) : todayCopy.noCompleteImportRecorded,
          )}
        </Copy>
        <Copy small>
          {todayCopy.lastRefreshAttempt(
            w.syncReceipt
              ? formatDateTime(w.syncReceipt.attemptedAt) +
                  ' · ' +
                  (w.syncReceipt.status === 'complete'
                    ? todayCopy.complete
                    : todayCopy.someDataMayBeMissing)
              : todayCopy.noneRecorded,
          )}
        </Copy>
        <Button secondary title={todayCopy.checkBankAccess} onPress={() => navigate('Accounts')} />
        <Copy>
          {todayCopy.monthReviewStatus(
            counts.pastMonth(p.monthsReviewed),
            counts.transaction(totals.unreviewed),
          )}
        </Copy>
        <Copy small>{todayCopy.confirmEachMonthDetail}</Copy>
        <Button
          secondary
          title={todayCopy.checkCompleteMonths}
          onPress={() => navigate('Activity')}
        />
      </Card>
      <AdaptiveColumns>
        {' '}
        <Card variant="plain" title={todayCopy.financialWellbeing}>
          <Heading>
            {w.planConfirmedAt && r.score !== null
              ? todayCopy.scoreValue(r.score)
              : todayCopy.moreEvidenceNeeded}
          </Heading>
          <Copy small>
            {w.planConfirmedAt && r.score !== null
              ? todayCopy.scoreBreakdown(r.components.cash, r.components.margin, r.components.debt)
              : todayCopy.confirmABaselineAllText}
          </Copy>
          <HelpNote summary={todayCopy.scoreDataSummary}>
            <Copy small>
              {todayCopy.scoreEvidenceHelp(
                w.planConfirmedAt ? todayCopy.confirmedDetail : todayCopy.needsConfirmation,
                p.coverageConfirmed ? todayCopy.confirmedDetail : todayCopy.needed,
                p.monthsReviewed,
              )}
            </Copy>
          </HelpNote>
          <Copy small>{todayCopy.aGuideBasedOnTheDataYou}</Copy>
        </Card>
        <Card variant="plain" title={todayCopy.yourMonthlyCheckIn}>
          <Line label={todayCopy.reviewedEssentialsFlexiLabel} value={<Money value={scoped} />} />
          <Line
            label={todayCopy.plannedEssentialsFlexible}
            value={<Money value={p.essentials + p.flexible} />}
          />
          <HelpNote summary={todayCopy.outsideTheseCategoriesSummary}>
            <Copy small>
              {counts.reviewedSpendingEntry(excluded.length)}
              {todayCopy.outsideTheseCategoriesDetail}
              <Money value={excluded.reduce((sum, t) => sum + t.amount, 0)} />
              {todayCopy.theyExcludedComparisonDetail}
            </Copy>
          </HelpNote>
        </Card>
      </AdaptiveColumns>
      <Button
        secondary
        title={store.demo ? todayCopy.showYourData : todayCopy.tryExampleData}
        onPress={() => store.setDemo(!store.demo)}
      />
    </View>
  );
}

function TodayHero({ plan, workspace }: { plan: Plan; workspace: Workspace }) {
  const { colors: c, hideAmounts } = useTheme();
  const result = assess(plan);
  return (
    <View style={{ padding: 16, gap: 8, borderRadius: 24, backgroundColor: c.card }}>
      <Copy strong>{todayCopy.monthlyHeadroom}</Copy>
      {(hideAmounts || plan.income > 0) && (
        <Money textStyle={[s.number, { color: c.text }]} value={result.surplus} />
      )}
      <HeadroomBar plan={plan} />
      <Copy small>
        {workspace.planConfirmedAt ? todayCopy.heroConfirmed : todayCopy.heroProvisional}
      </Copy>
    </View>
  );
}
