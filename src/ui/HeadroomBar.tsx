import React from 'react';
import {Animated, View} from 'react-native';
import type {Plan} from '../lib/finance';
import {amountContent} from '../lib/amountDisplay';
import {shapeRoles} from '../lib/presentation';
import {headroomSegments, type HeadroomPart, type HeadroomSegment} from '../lib/headroomSegments';
import {headroomCopy} from '../strings/headroom';
import {Copy, Money} from './components';
import {useMotionValue} from './motion';
import {useInterfaceVisible} from './privacy';
import {styles as s, useTheme} from './theme';

const labels = {
  essentials: headroomCopy.essentials,
  flexible: headroomCopy.flexible,
  annual: headroomCopy.annual,
  minimums: headroomCopy.minimums,
  headroom: headroomCopy.headroom,
};

function useSegmentStyle(id: HeadroomPart, hidden: boolean) {
  const {colors: c} = useTheme();
  return {
    backgroundColor: hidden ? c.divider : id === 'headroom' ? c.primaryContainer :
      id === 'essentials' || id === 'annual' ? c.primary : c.outline,
    borderColor: hidden ? c.divider : id === 'headroom' ? c.primary : c.surface,
    borderWidth: id === 'headroom' && !hidden ? 2 : 1,
  };
}

function BarSegment({segment, hidden}: {segment: HeadroomSegment; hidden: boolean}) {
  const {reducedMotion} = useTheme();
  const visible = useInterfaceVisible();
  const style = useSegmentStyle(segment.id, hidden);
  const scale = useMotionValue(1, {initial: 0, enabled: visible && !reducedMotion && !hidden});
  return (
    <View style={{flex: segment.share, overflow: 'hidden'}}>
      <Animated.View style={[style, {
        height: 32, transform: [{scaleX: scale}], transformOrigin: ['0%', '50%', 0],
      }]}/>
    </View>
  );
}

function LegendRow({segment, hidden}: {segment: HeadroomSegment; hidden: boolean}) {
  const {colors: c} = useTheme();
  const style = useSegmentStyle(segment.id, hidden);
  return (
    <View accessible accessibilityLabel={`${labels[segment.id]}, ${amountContent(segment.amount, false, hidden).label}`}
      style={{flexDirection: 'row', alignItems: 'flex-start', gap: 8}}>
      <View accessible={false} style={[style, {width: 12, height: 12, borderRadius: shapeRoles.chip, marginTop: 4}]}/>
      <View style={{flex: 1, minWidth: 0}}><Copy small>{labels[segment.id]}</Copy></View>
      <Money value={segment.amount} textStyle={[s.small, {color: c.text, fontVariant: ['tabular-nums']}]}/>
    </View>
  );
}

export function HeadroomBar({plan}: {plan: Plan}) {
  const {colors: c, hideAmounts} = useTheme();
  const model = headroomSegments(plan);
  // A fixed set of equal segments conceals values, debt presence and overspending.
  const segments = hideAmounts
    ? (['essentials', 'flexible', 'annual', 'minimums', 'headroom'] as const)
      .map(id => ({id, amount: 0, share: 1 / 5}))
    : model.segments;
  const empty = !hideAmounts && model.empty;
  return (
    <View style={{gap: 8}}>
      <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
        style={{height: 32, borderRadius: shapeRoles.bar, overflow: 'hidden', flexDirection: 'row', backgroundColor: c.divider}}>
        {!empty && (model.overspent && !hideAmounts
          ? <View style={{flex: 1, backgroundColor: c.error}}/>
          : segments.map(segment => <BarSegment key={`${segment.id}:${segment.share}:${segment.amount}`} segment={segment} hidden={hideAmounts}/>))}
      </View>
      {empty ? <Copy small>{headroomCopy.emptyPrompt}</Copy> : <>
        {!hideAmounts && model.overspent && <Copy strong>{headroomCopy.overspendLabel}</Copy>}
        {segments.map(segment => <LegendRow key={segment.id} segment={segment} hidden={hideAmounts}/>)}
        {!hideAmounts && model.minimumsIncluded && <Copy small>{headroomCopy.minimumsHelp}</Copy>}
      </>}
    </View>
  );
}
