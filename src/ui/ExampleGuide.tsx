import React from 'react';
import {Alert} from 'react-native';
import {monthKey} from '../lib/workspace';
import {useWorkspace} from '../state/hooks';
import {Button,Card,Copy,Notice} from './components';
const lessons=[
 {title:'Review a transaction',body:'Open Activity and classify the fictional grocer and rail payments. Try a remembered rule. Add a fictional cash entry to try edit/delete and undo. Three completed past months are already available in the month chooser.',tab:'Activity'},
 {title:'Understand the plan',body:'Open a Plan section, make a draft change, then apply or close it. Check the debt repayment order and individual goal funding. Use a past month to preview actuals; annual insurance stays separate from the monthly reserve.',tab:'Plan'},
 {title:'Compare a move',body:'Select both fictional saved scenarios to compare their mortgage, completion cash and exchange gap. Adjust an assumption, then update a saved scenario. No real property or lender data is used.',tab:'Move'},
 {title:'Check the evidence',body:'The overview score uses fictional confirmed evidence from three past months. It demonstrates the interface, not your finances. Review the component explanation and evidence checklist below.',tab:'Today'}
] as const;
export function ExampleGuide({navigate}:{navigate:(tab:string,month?:string)=>void}){
 const store=useWorkspace();if(!store.demo)return null;const step=store.workspace.exampleStep??0,lesson=lessons[step];
 const reset=()=>Alert.alert('Reset fictional examples?','This replaces only example figures, classifications, coverage, rules and scenarios with the original walkthrough. Personal data and preferences are preserved.',[{text:'Cancel',style:'cancel'},{text:'Reset examples',onPress:()=>store.resetExample()}]);
 if(store.workspace.exampleStep===undefined)return <Card variant="outlined" title="Try the complete example journey"><Copy>Your saved example figures are from an earlier version. Reset the example workspace to add three fictional past months, two Move scenarios and the guide. Your personal workspace stays unchanged.</Copy><Button title="Load the original walkthrough examples" onPress={reset}/></Card>;
 return <Card variant="outlined" title={lesson?`Example guide · ${step+1} of ${lessons.length}`:'Example guide complete'}><Notice kind="info">All figures, statements and confirmations in this workspace are fictional.</Notice>{lesson?<><Copy strong>{lesson.title}</Copy><Copy>{lesson.body}</Copy><Button title={lesson.tab==='Move'&&!store.data.preferences.moveEnabled?'Enable Move in Settings':'Explore '+lesson.tab} onPress={()=>navigate(lesson.tab==='Move'&&!store.data.preferences.moveEnabled?'Settings':lesson.tab,lesson.tab==='Activity'?monthKey():undefined)}/><Button secondary title={step===lessons.length-1?'Finish guide':'Next guide step'} onPress={()=>store.change(w=>({...w,exampleStep:step+1}))}/>{step>0&&<Button secondary title="Previous guide step" onPress={()=>store.change(w=>({...w,exampleStep:step-1}))}/>}</>:<><Copy>Continue exploring, replay the guide with your current example edits, or restore the original fictional figures.</Copy><Button secondary title="Replay guide without resetting figures" onPress={()=>store.change(w=>({...w,exampleStep:0}))}/></>}<Button secondary title="Reset original examples and guide" onPress={reset}/></Card>;
}
