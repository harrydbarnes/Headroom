import {HelpNote} from './components';
import {todayCopy} from '../strings/today';
import {exampleLessons as lessons} from '../strings/today';
import React from 'react';
import {Alert} from 'react-native';
import {monthKey} from '../lib/workspace';
import {useWorkspace} from '../state/hooks';
import {Button,Card,Copy,Notice} from './components';

export function ExampleGuide({navigate}:{navigate:(tab:string,month?:string)=>void}){
 const store=useWorkspace();if(!store.demo)return null;const step=store.workspace.exampleStep??0,lesson=lessons[step];
 const reset=()=>Alert.alert(todayCopy.resetExampleData,todayCopy.thisReplacesOnlyExampleDataClassificationsCoverage,[{text:todayCopy.cancel,style:'cancel'},{text:todayCopy.resetExamples,onPress:()=>store.resetExample()}]);
 if(store.workspace.exampleStep===undefined)return <Card variant="outlined" title={todayCopy.exploreExampleData}><HelpNote summary={todayCopy.yourSavedExampleDataAreFromAn}><Copy>{todayCopy.yourSavedExampleDataAreFromAn2}</Copy></HelpNote><Button title={todayCopy.resetExampleData2} onPress={reset}/></Card>;
 return <Card variant="outlined" title={lesson?todayCopy.message102(step+1,lessons.length):todayCopy.exampleGuideComplete}><Notice kind="info">{todayCopy.allAmountsStatementsAndConfirmationsShownHere}</Notice>{lesson?<><Copy strong>{lesson.title}</Copy><HelpNote summary={lesson.body.split('. ')[0]+todayCopy.separator2}><Copy>{lesson.body}</Copy></HelpNote><Button title={lesson.tab==='Move'&&!store.data.preferences.moveEnabled?todayCopy.showMoveSettings:todayCopy.explore+lesson.tab} onPress={()=>navigate(lesson.tab==='Move'&&!store.data.preferences.moveEnabled?'Settings':lesson.tab,lesson.tab==='Activity'?monthKey():undefined)}/><Button secondary title={step===lessons.length-1?todayCopy.finishGuide:todayCopy.nextGuideStep} onPress={()=>store.change(w=>({...w,exampleStep:step+1}))}/>{step>0&&<Button secondary title={todayCopy.previousGuideStep} onPress={()=>store.change(w=>({...w,exampleStep:step-1}))}/>}</>:<><Copy>{todayCopy.continueExploringReplayTheGuideWithYour}</Copy><Button secondary title={todayCopy.replayGuide} onPress={()=>store.change(w=>({...w,exampleStep:0}))}/></>}<Button secondary title={todayCopy.resetExampleData2} onPress={reset}/></Card>;
}
