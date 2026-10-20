import React, {useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import {common} from '../strings/common';
import {Copy} from './components';
import {styles as s, useTheme} from './theme';

/** Collapsed content leaves the accessibility tree as well as the visual flow. */
export function Disclosure({title, summary, children}: {
  title: string; summary?: React.ReactNode; children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const {colors: c} = useTheme();
  return (
    <View style={{gap: 8}}>
      <Pressable accessibilityRole="button" accessibilityState={{expanded}}
        accessibilityHint={expanded ? common.hidesDetail : common.showsDetail}
        onPress={() => setExpanded(value => !value)}
        style={({pressed}) => ({minHeight: 48, paddingVertical: 8, gap: 4, opacity: pressed ? .7 : 1})}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
          <Text style={[s.body, {flex: 1, color: c.text, fontWeight: '600'}]}>{title}</Text>
          <Text accessible={false} importantForAccessibility="no" style={[s.heading, {color: c.primary}]}>{expanded ? '⌃' : '⌄'}</Text>
        </View>
        {summary !== undefined && <Copy small>{summary}</Copy>}
      </Pressable>
      {expanded && <View style={{gap: 16}}>{children}</View>}
    </View>
  );
}
