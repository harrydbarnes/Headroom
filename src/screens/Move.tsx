import {Disclosure} from '../ui/Disclosure';
import {MoveVerdict} from '../ui/MoveVerdict';
import {saleCostFields,purchaseCostFields} from '../strings/move';
import {counts} from '../strings/format';
import {displayMessage} from '../strings/messages';
import {moveCopy} from '../strings/move';
import {HelpNote} from '../ui/components';
import {formatDate} from '../lib/dates';
import {counted} from '../strings/format';
import {toUserMessage} from '../strings/errors';
import React,{useState,useRef} from 'react';
import {Alert,View} from 'react-native';
import {houseMove,type FeeInput,type HouseMoveInput} from '../lib/calculators/houseMove';
import {clone,initialHouse,moveBudget} from '../lib/workspace';
import {useWorkspace} from '../state/hooks';
import {Button,Card,Choice,Copy,Field,Input,Line,Money,Notice,Page,Toggle,SectionRow,Sheet} from '../ui/components';
import {ScenarioManager} from '../ui/ScenarioManager';
import {styles as s} from '../ui/theme';
export function Move(){
 const store=useWorkspace(),w=store.workspace,m=w.move,h=m.input,result=houseMove(h),budget=moveBudget(w),[section,setSection]=useState('');
 const returnFocus=useRef<()=>void>(()=>{});
 return <Page><MoveVerdict workspace={w}/><Notice>{moveCopy.englandNorthernIrelandDetail}</Notice>
  {!store.demo&&<Card title={moveCopy.yourMoveInputs}><HelpNote summary={moveCopy.newPlanSummary}><Copy small>{moveCopy.newPlanDetail}</Copy></HelpNote><Button secondary title={moveCopy.useExampleTemplate} onPress={()=>Alert.alert(moveCopy.useExampleMoveTemplate,moveCopy.replacesMoveAssumptionsText,[{style:'cancel',text:moveCopy.cancel},{text:moveCopy.useExampleTemplate,onPress:()=>store.change(x=>({...x,move:{...x.move,input:clone(initialHouse),provenance:'example-template',confirmed:false}}))}])}/></Card>}

  <MoveAssumptions/>

  <SectionRow title={moveCopy.moveCostBreakdown} summary={moveCopy.mortgageCostsAndExchangeCash} onPress={focus=>{returnFocus.current=focus;setSection('Costs');}}/><Sheet returnFocus={()=>returnFocus.current()} visible={section==='Costs'} onClose={()=>setSection('')} title={moveCopy.moveCostBreakdown}>  <Card title={moveCopy.completionAndBorrowing}><Copy small>{m.confirmed?moveCopy.confirmedAssumptions:moveCopy.provisionalConfirmAssumText}</Copy><Line label={moveCopy.stampDuty} value={<Money value={result.sdlt}/>}/><Line label={moveCopy.purchaseFees} value={<Money value={result.fees.total}/>}/><Line label={moveCopy.mortgage} value={<Money value={result.loan}/>}/><Line label={moveCopy.lTV} value={result.ltv===null?moveCopy.unavailable:result.ltv.toFixed(1)+'%'}/><Line label={moveCopy.monthlyMortgage} value={<Money value={result.payment}/>}/><Line label={moveCopy.rateStressLabel} value={<Money value={result.stress[1].payment}/>}/><Line label={moveCopy.cashAfterCompletion} value={<Money value={result.cashAfterCompletion}/>}/>{result.warnings.map(warning=><Notice key={warning}>{displayMessage(warning)}</Notice>)}</Card>
  <Card title={moveCopy.cashNeededBeforeCompletion}><Line label={moveCopy.exchangeDepositLabel} value={<Money value={result.exchange.deposit}/>}/><Line label={moveCopy.savingsAfterEarlyCosts} value={<Money value={result.exchange.savingsRemaining}/>}/><Line label={moveCopy.exchangeCashGapLabel} value={<Money value={result.exchange.gap}/>}/><HelpNote summary={moveCopy.saleEquityMayArriveTooLateTo}><Copy small>{moveCopy.exchangeTimingDetail}</Copy></HelpNote></Card>
</Sheet>
  <MoveHousing/>
  <ScenarioManager/>
 </Page>;
}

function MoveInputSummary({
  label,
  value,
  other,
}: {
  label: string;
  value: number;
  other?: number;
}) {
  return (
    <Copy small>
      {label}
      {': '}
      <Money value={value} />
      {other !== undefined && (
        <>
          {' · '}
          <Money value={other} />
        </>
      )}
    </Copy>
  );
}

function MoveAssumptions() {
  const store = useWorkspace();
  const m = store.workspace.move;
  const h = m.input;
  const result = houseMove(h);
  const update = (patch: Partial<HouseMoveInput>) =>
    store.change((x) => ({
      ...x,
      move: { ...x.move, input: { ...x.move.input, ...patch }, confirmed: false },
    }));
  const fee = (key: keyof FeeInput, value: number) => update({ fees: { ...h.fees, [key]: value } });
  return (
    <Disclosure
      title={moveCopy.moveAssumptions}
      summary={<MoveInputSummary label={moveCopy.propertySummary} value={h.purchase} />}
    >
      <Copy small>
        {moveCopy.inputSourceStatus(
          m.provenance === 'example-template'
            ? moveCopy.exampleSource
            : m.provenance === 'personal'
              ? moveCopy.personalSource
              : moveCopy.savedSource,
        )}
      </Copy>
      <Copy small>
        {moveCopy.taxBasisStatus(
          h.period === 'current'
            ? moveCopy.currentBands
            : moveCopy.historicalBandsFrom + formatDate(h.period),
        )}
      </Copy>
      {h.period !== 'current' && (
        <Button
          secondary
          title={moveCopy.useCurrentTaxBands}
          onPress={() => update({ period: 'current' })}
        />
      )}
      <Field
        label={moveCopy.purchasePrice}
        value={h.purchase}
        onChange={(purchase) => update({ purchase })}
      />
      <Toggle
        label={moveCopy.sellingACurrentProperty}
        value={h.sale.selling}
        onChange={(selling) =>
          update({ sale: { ...h.sale, selling }, buyer: selling ? 'standard' : h.buyer })
        }
      />
      {h.sale.selling && (
        <>
          <Field
            label={moveCopy.salePrice}
            value={h.sale.price}
            onChange={(price) => update({ sale: { ...h.sale, price } })}
          />
          <Field
            label={moveCopy.mortgageRedemptionExcluLabel}
            value={h.sale.redemption}
            onChange={(redemption) => update({ sale: { ...h.sale, redemption } })}
          />
        </>
      )}
      <Field
        label={moveCopy.availableSavings}
        value={h.savings}
        onChange={(savings) => update({ savings })}
      />
      <Field
        label={moveCopy.cashToRetain}
        value={h.reserve}
        onChange={(reserve) => update({ reserve })}
      />
      <Field
        money={false}
        max={97}
        label={moveCopy.mortgageInterest}
        value={h.annualRate}
        onChange={(annualRate) => update({ annualRate })}
      />
      <Field
        money={false}
        min={1}
        max={50}
        integer
        label={moveCopy.mortgageTermYears}
        value={h.years}
        onChange={(years) => update({ years })}
      />
      <Disclosure
        title={moveCopy.buyerAndTax}
        summary={
          <Copy small>
            {moveCopy.buyerSummary(
              {
                standard: moveCopy.standard,
                firstTime: moveCopy.firstTimeBuyer,
                additional: moveCopy.additionalProperty,
              }[h.buyer],
              h.period === 'current'
                ? moveCopy.currentBands
                : moveCopy.historicalBandsFrom + formatDate(h.period),
            )}
          </Copy>
        }
      >
        <Copy small>{moveCopy.autosaveHelp}</Copy>
        <Copy strong>{moveCopy.buyerAndTax}</Copy>
        <View style={s.wrap}>
          {(['standard', 'firstTime', 'additional'] as const).map((b) => (
            <Choice
              key={b}
              title={
                {
                  standard: moveCopy.standard,
                  firstTime: moveCopy.firstTimeBuyer,
                  additional: moveCopy.additionalProperty,
                }[b]
              }
              selected={h.buyer === b}
              onPress={() =>
                update({
                  buyer: b,
                  sale: { ...h.sale, selling: b === 'firstTime' ? false : h.sale.selling },
                })
              }
            />
          ))}
        </View>
        <Copy small>{moveCopy.buyerEligibilityHelp}</Copy>
        <Toggle
          label={moveCopy.nonResidentSDLTSurchargLabel}
          value={h.nonResident}
          onChange={(nonResident) => update({ nonResident })}
        />
      </Disclosure>
      <Disclosure
        title={moveCopy.saleCosts}
        summary={
          <MoveInputSummary
            label={moveCopy.saleSummary}
            value={h.sale.selling ? h.sale.price : 0}
            other={h.sale.selling ? h.sale.redemption : 0}
          />
        }
      >
        <Copy small>{moveCopy.autosaveHelp}</Copy>
        {h.sale.selling && (
          <>
            <Copy strong>{moveCopy.saleCosts}</Copy>
            <Field
              money={false}
              max={100}
              label={moveCopy.estateAgentFee}
              value={h.sale.agentPercent}
              onChange={(agentPercent) => update({ sale: { ...h.sale, agentPercent } })}
            />
            <Field
              money={false}
              max={100}
              label={moveCopy.estateAgentVAT}
              value={h.sale.agentVat}
              onChange={(agentVat) => update({ sale: { ...h.sale, agentVat } })}
            />
            {saleCostFields.map(([key, label]) => (
              <Field
                key={key}
                label={label}
                value={h.sale[key]}
                onChange={(v) => update({ sale: { ...h.sale, [key]: v } })}
              />
            ))}
          </>
        )}
      </Disclosure>
      <Disclosure
        title={moveCopy.purchaseFees}
        summary={<MoveInputSummary label={moveCopy.feeSummary} value={result.fees.total} />}
      >
        <Copy small>{moveCopy.autosaveHelp}</Copy>
        <Copy strong>{moveCopy.purchaseFeesAndMovingCosts}</Copy>
        {purchaseCostFields.map(([key, label]) => (
          <Field key={key} label={label} value={h.fees[key]} onChange={(v) => fee(key, v)} />
        ))}
        <Field
          money={false}
          max={100}
          label={moveCopy.legalVAT}
          value={h.fees.legalVat}
          onChange={(v) => fee('legalVat', v)}
        />
      </Disclosure>
      <Disclosure
        title={moveCopy.borrowingAndFunding}
        summary={
          <MoveInputSummary
            label={moveCopy.fundingSummary}
            value={result.loan}
            other={h.borrowingLimit}
          />
        }
      >
        <Copy small>{moveCopy.autosaveHelp}</Copy>
        <Copy strong>{moveCopy.borrowingAndFunding}</Copy>
        <Field
          label={moveCopy.extraSavings}
          value={h.extraSavings}
          onChange={(extraSavings) => update({ extraSavings })}
        />
        <Field
          label={moveCopy.indicativeBorrowingLimit}
          value={h.borrowingLimit}
          onChange={(borrowingLimit) => update({ borrowingLimit })}
        />
        <Field
          money={false}
          max={100}
          label={moveCopy.preferredLTVCeiling}
          value={h.ltvCeiling}
          onChange={(ltvCeiling) => update({ ltvCeiling })}
        />
        <Toggle
          label={moveCopy.interestOnlyMortgage}
          value={h.interestOnly}
          onChange={(interestOnly) => update({ interestOnly })}
        />
        <Toggle
          label={moveCopy.useAFixedLoanInsteadOfThe}
          value={h.loanMode === 'fixed'}
          onChange={(v) => update({ loanMode: v ? 'fixed' : 'required' })}
        />
        {h.loanMode === 'fixed' && (
          <Field
            label={moveCopy.fixedMortgageLoan}
            value={h.fixedLoan}
            onChange={(fixedLoan) => update({ fixedLoan })}
          />
        )}
      </Disclosure>
      <Disclosure
        title={moveCopy.exchangeTiming}
        summary={
          <MoveInputSummary
            label={moveCopy.exchangeSummary}
            value={result.exchange.deposit}
            other={h.upfront}
          />
        }
      >
        <Copy small>{moveCopy.autosaveHelp}</Copy>
        <Copy strong>{moveCopy.exchangeTiming}</Copy>
        <Field
          money={false}
          max={100}
          label={moveCopy.exchangeDeposit}
          value={h.exchangePercent}
          onChange={(exchangePercent) => update({ exchangePercent })}
        />
        <Field
          label={moveCopy.otherCostsPaidBeforeExchange}
          value={h.upfront}
          onChange={(upfront) => update({ upfront })}
        />
      </Disclosure>
      <Button
        title={m.confirmed ? moveCopy.assumptionsConfirmed : moveCopy.confirmMoveAssumptions}
        disabled={h.purchase <= 0}
        onPress={() =>
          store.change((x) => ({
            ...x,
            move: {
              ...x.move,
              confirmed: true,
              ...(!store.demo ? { provenance: 'personal' as const } : {}),
            },
          }))
        }
      />
    </Disclosure>
  );
}

function MoveHousing() {
  const store = useWorkspace();
  const w = store.workspace;
  const m = w.move;
  const budget = moveBudget(w);
  return (
    <Disclosure
      title={moveCopy.lifeAfterMoving}
      summary={<MoveInputSummary label={moveCopy.housingSummary} value={m.currentHousing} />}
    >
      <Copy>{moveCopy.currentHousingAlreadyText}</Copy>
      <View style={s.wrap}>
        {(['mortgage', 'rent', 'none'] as const).map((type) => (
          <Choice
            key={type}
            title={
              { mortgage: moveCopy.mortgage, rent: moveCopy.rent, none: moveCopy.noCurrentPayment }[
                type
              ]
            }
            selected={m.housingType === type}
            onPress={() =>
              store.change((x) => ({
                ...x,
                move: {
                  ...x.move,
                  housingType: type,
                  currentHousing: type === 'none' ? 0 : x.move.currentHousing,
                  ...(type === 'none' ? { housingStops: false, overlapMonths: 0 } : {}),
                  housingConfirmed: false,
                },
              }))
            }
          />
        ))}
      </View>
      {m.housingType !== 'none' && (
        <>
          <Field
            label={moveCopy.currentMonthlyHousingPayment}
            value={m.currentHousing}
            onChange={(currentHousing) =>
              store.change((x) => ({
                ...x,
                move: { ...x.move, currentHousing, housingConfirmed: false },
              }))
            }
          />
          <Toggle
            label={moveCopy.thisPaymentStopsAfterTheMove}
            value={m.housingStops}
            onChange={(housingStops) =>
              store.change((x) => ({
                ...x,
                move: { ...x.move, housingStops, housingConfirmed: false },
              }))
            }
          />
          {m.housingStops && (
            <Field
              money={false}
              integer
              min={0}
              max={120}
              label={moveCopy.monthsOverlappingOldLabel}
              value={m.overlapMonths}
              onChange={(overlapMonths) =>
                store.change((x) => ({
                  ...x,
                  move: { ...x.move, overlapMonths, housingConfirmed: false },
                }))
              }
            />
          )}
        </>
      )}
      <Toggle
        label={moveCopy.myCurrentHousingLabel}
        value={m.housingConfirmed}
        onChange={(housingConfirmed) =>
          store.change((x) => ({ ...x, move: { ...x.move, housingConfirmed } }))
        }
      />
      {budget === null ? (
        <Notice>{moveCopy.confirmMonthlyBaselineDetail}</Notice>
      ) : (
        <>
          <Line label={moveCopy.monthlyHeadroomAfterLabel} value={<Money value={budget} />} />
          {m.housingStops && m.overlapMonths > 0 && (
            <>
              <Line
                label={moveCopy.scenarioHeadroomLabel(counts.overlappingMonth(m.overlapMonths))}
                value={<Money value={moveBudget(w, true)!} />}
              />
              <Line
                label={moveCopy.totalOldHousingLabel}
                value={<Money value={m.currentHousing * m.overlapMonths} />}
              />
            </>
          )}
        </>
      )}
      <HelpNote summary={moveCopy.redemptionSummary}>
        <Copy small>{moveCopy.redemptionDetail}</Copy>
      </HelpNote>
    </Disclosure>
  );
}
