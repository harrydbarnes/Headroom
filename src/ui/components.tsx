import React,{createContext,useContext,useEffect,useId,useLayoutEffect,useRef,useState} from 'react';
import {AccessibilityInfo,Animated,findNodeHandle,Keyboard,KeyboardAvoidingView,Modal,PanResponder,Platform,Pressable,ScrollView,StyleSheet,Switch,Text,TextInput,View,useWindowDimensions,type TextInputProps,type TextStyle,type StyleProp} from 'react-native';
import {styles as s,useTheme} from './theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {layoutPolicy,motion,TransitionSlot,shapeRoles,releaseSheetDrag} from '../lib/presentation';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {common} from '../strings/common';
import {dateInput,monthInput,formatTaxYear,parseUkDate,parseUkMonth,parseTaxYear} from '../lib/dates';
import {numberFieldText, numberFieldValue} from '../lib/numberField';
import {amountContent} from '../lib/amountDisplay';
import {CoverWorkspace,useInterfaceVisible} from './privacy';
const AmountTextContext=createContext<StyleProp<TextStyle>|null>(null);
const ContainerTextColor=createContext<TextStyle['color']>(undefined);
const Validation=createContext({invalid:false,update:(_id:string,_invalid:boolean)=>{}});
function FormScope({children}:{children:React.ReactNode}){const [invalid,setInvalid]=useState<string[]>([]);return <Validation.Provider value={{invalid:invalid.length>0,update:(id,bad)=>setInvalid(prior=>bad?(prior.includes(id)?prior:[...prior,id]):prior.includes(id)?prior.filter(x=>x!==id):prior)}}>{children}</Validation.Provider>;}

export function Copy({
  children,
  small = false,
  strong = false,
}: {
  children: React.ReactNode;
  small?: boolean;
  strong?: boolean;
}) {
  const { colors: c } = useTheme(),
    containerColor = useContext(ContainerTextColor),
    style = [
      small ? s.small : s.body,
      {
        color: containerColor ?? (small ? c.muted : c.text),
        fontWeight: strong ? ('600' as const) : ('400' as const),
      },
    ];
  if (
    React.isValidElement<{ textStyle?: StyleProp<TextStyle> }>(children) &&
    children.type === Money
  )
    return React.cloneElement(children, { textStyle: style });
  return (
    <AmountTextContext.Provider value={style}>
      <Text style={style}>{children}</Text>
    </AmountTextContext.Provider>
  );
}
export function Heading({
  children,
  focusRef,
}: {
  children: React.ReactNode;
  focusRef?: React.RefObject<Text | null>;
}) {
  const { colors: c } = useTheme(),
    containerColor = useContext(ContainerTextColor);
  return (
    <Text
      ref={focusRef}
      accessible
      accessibilityRole="header"
      style={[s.heading, { color: containerColor ?? c.text }]}
    >
      {children}
    </Text>
  );
}

export function TonalCard({ children }: { children: React.ReactNode }) {
  const { colors: c } = useTheme();
  return (
    <ContainerTextColor.Provider value={c.onPrimaryContainer}>
      <View
        style={{
          padding: 16,
          gap: 8,
          borderRadius: shapeRoles.card,
          backgroundColor: c.primaryContainer,
        }}
      >
        {children}
      </View>
    </ContainerTextColor.Provider>
  );
}
export function Card({title,children,titleRef,variant='filled'}:{title?:string;children:React.ReactNode;titleRef?:React.RefObject<Text|null>;variant?:'filled'|'plain'|'outlined'}){const {colors:c}=useTheme();return <View style={[s.card,{backgroundColor:variant==='filled'?c.card:'transparent',borderWidth:variant==='outlined'?1:0,borderColor:c.divider,paddingHorizontal:variant==='plain'?0:20}]}>{title&&<Heading focusRef={titleRef}>{title}</Heading>}{children}</View>;}
export function Button({title, onPress, secondary = false, variant, disabled = false, danger = false}: {
  title: string; onPress: () => void; secondary?: boolean;
  variant?: 'primary' | 'secondary' | 'text'; disabled?: boolean; danger?: boolean;
}) {
  const {colors: c} = useTheme();
  const validation = useContext(Validation);
  const appearance = variant ?? (secondary ? 'secondary' : 'primary');
  const blocked = disabled || (appearance === 'primary' && !danger && validation.invalid);
  const backgroundColor = appearance === 'text' ? undefined : danger ? c.error : appearance === 'secondary' ? c.container : c.primary;
  const color = appearance === 'text' ? (danger ? c.error : c.primary) : danger ? c.onError : appearance === 'secondary' ? c.text : c.onPrimary;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title.replace(/ · /g, ', ')}
      accessibilityState={{disabled: blocked}} disabled={blocked}
      onPress={() => {Keyboard.dismiss(); onPress();}}
      android_ripple={{color: c.primaryContainer}}
      style={({pressed}) => [s.button, {overflow: 'hidden', backgroundColor, opacity: blocked ? .45 : pressed ? .7 : 1}]}>
      <Text style={{color, fontSize: 14, lineHeight: 20, fontWeight: '700', textAlign: 'center'}}>{title}</Text>
    </Pressable>
  );
}
export function Choice({title,selected,onPress,disabled=false}:{title:string;selected:boolean;onPress:()=>void;disabled?:boolean}){const {colors:c}=useTheme();return <Pressable accessibilityRole="button" accessibilityLabel={title.replace(/ · /g,', ')} accessibilityState={{selected,disabled}} disabled={disabled} onPress={onPress} style={({pressed})=>[s.chip,{backgroundColor:selected?c.primaryContainer:c.card,borderColor:selected?c.primary:c.outline,opacity:disabled?.4:pressed?.7:1}]}><Text style={{color:selected?c.onPrimaryContainer:c.text,fontSize:14,lineHeight:20,fontWeight:selected?'700':'400'}}>{title}</Text></Pressable>;}
export function Toggle({label,value,onChange,disabled=false}:{label:string;value:boolean;onChange:(v:boolean)=>void;disabled?:boolean}){const {colors:c}=useTheme();return <View style={s.row}><View style={{flex:1}}><Copy>{label}</Copy></View><Switch accessibilityLabel={label} disabled={disabled} value={value} onValueChange={onChange} trackColor={{true:c.primary,false:c.outline}}/></View>;}
export function Input({label,error,...props}:TextInputProps&{label:string;error?:string}){const {colors:c}=useTheme(),labelId=useId();return <View style={{gap:6}}><Text nativeID={labelId} style={[s.label,{color:c.muted}]}>{label}</Text><TextInput {...props} selectionColor={c.primary} cursorColor={c.primary} accessibilityLabel={label} accessibilityLabelledBy={Platform.OS==='android'?labelId:undefined} accessibilityHint={error?common.inputErrorHint(error):props.accessibilityHint} placeholderTextColor={c.muted} style={[s.input,{color:c.text,borderColor:error?c.error:c.outline,backgroundColor:c.surface},props.style]}/>{!!error&&<Text accessibilityLiveRegion="assertive" style={[s.small,{color:c.error}]}>{error}{common.unsavedEdit}</Text>}</View>;}
export function Field({label, value, onChange, money = true, min = 0, max = 1e10, integer = false}: {
  label: string; value: number; onChange: (value: number) => void;
  money?: boolean; min?: number; max?: number; integer?: boolean;
}) {
  const [raw, setRaw] = useState(() => numberFieldText(value, money));
  const [error, setError] = useState('');
  const editing = useRef(false);
  const fieldId = useId();
  const validation = useContext(Validation);
  const updateValidation = useRef(validation.update);
  updateValidation.current = validation.update;
  const parse = (text: string) => numberFieldValue(text, {money, min, max, integer});

  useEffect(() => {
    if (!editing.current) {
      setRaw(numberFieldText(value, money));
      setError('');
      updateValidation.current(fieldId, false);
    }
  }, [value, money]);
  useEffect(() => () => updateValidation.current(fieldId, false), []);

  const change = (text: string) => {
    setRaw(text);
    const next = parse(text);
    updateValidation.current(fieldId, next === null);
    setError(next === null ? common.numberRange(integer, min, max) : '');
    if (next !== null) onChange(next);
  };
  const finish = () => {
    editing.current = false;
    const next = parse(raw);
    if (next !== null) setRaw(numberFieldText(next, money));
  };

  return (
    <View style={{gap: 4}}>
      <Input label={label + (money ? ' (£)' : '')} error={error} keyboardType="decimal-pad"
        value={raw} placeholder={String(0)} onFocus={() => {editing.current = true;}}
        onChangeText={change} onBlur={finish} onSubmitEditing={finish}/>
    </View>
  );
}
export function Money({value,precise=false,textStyle}:{value:number;precise?:boolean;textStyle?:StyleProp<TextStyle>}){
 const {hideAmounts,colors:c,reducedMotion}=useTheme(),visible=useInterfaceVisible(),inlineStyle=useContext(AmountTextContext),{fontScale}=useWindowDimensions();
 const style=textStyle??inlineStyle??s.body,inline=!textStyle&&inlineStyle!==null,content=amountContent(value,precise,hideAmounts);
 const numbers=useRef(new Animated.Value(hideAmounts?0:1)).current,mask=useRef(new Animated.Value(hideAmounts?1:0)).current,previous=useRef(hideAmounts),slot=useRef(new TransitionSlot()).current;
 useLayoutEffect(()=>{
  slot.stop();numbers.stopAnimation();mask.stopAnimation();const changed=previous.current!==hideAmounts;previous.current=hideAmounts;
  if(reducedMotion||!visible||!changed){numbers.setValue(hideAmounts?0:1);mask.setValue(hideAmounts?1:0);return;}
  // Real text is already unmounted on hide; only the harmless mask fades in.
  if(hideAmounts)numbers.setValue(0);
  const animation=Animated.parallel([Animated.timing(mask,{toValue:hideAmounts?1:0,duration:motion.duration.privacy,useNativeDriver:true}),...(!hideAmounts?[Animated.timing(numbers,{toValue:1,duration:motion.duration.privacy,useNativeDriver:true})]:[])]);
  slot.replace({start:()=>animation.start(),stop:()=>animation.stop()});return()=>slot.stop();
 },[hideAmounts,reducedMotion,visible]);
 const flat=StyleSheet.flatten(style)??{};
 const layoutText=content.text??content.mask;
 // Inline attachments need explicit dimensions; never measure or retain hidden digits.
 const attachment=inline?{width:Math.max(1,layoutText.length)*(flat.fontSize??16)*fontScale*.65+4,height:(flat.lineHeight??24)*fontScale}:{};
 const frosted:TextStyle={color:c.muted,...(Platform.OS==='android'&&Number(Platform.Version)>=31?{filter:[{blur:10}]}:{color:'transparent',textShadowColor:c.muted,textShadowRadius:18,textShadowOffset:{width:0,height:0}})};
 return <View accessible accessibilityLabel={content.label} style={[{position:'relative',alignSelf:'flex-start',flexShrink:1},attachment]}>
  <Text accessible={false} importantForAccessibility="no-hide-descendants" style={[style,{opacity:0}]}>{layoutText}</Text>
  <Animated.Text accessible={false} importantForAccessibility="no-hide-descendants" style={[style,{position:'absolute',top:0,left:0,right:0,opacity:mask},frosted]}>{content.mask}</Animated.Text>
  {content.text!==null&&<Animated.Text accessible={false} importantForAccessibility="no-hide-descendants" style={[style,{position:'absolute',top:0,left:0,right:0,opacity:numbers}]}>{content.text}</Animated.Text>}
 </View>;
}

export function Line({label,value}:{label:string;value:React.ReactNode}){const {width,height,fontScale}=useWindowDimensions(),stacked=layoutPolicy(width,height,fontScale).stackValues;return <View style={[s.row,{alignItems:stacked?'stretch':'flex-start',flexDirection:stacked?'column':'row',gap:stacked?4:12}]}><View style={{flex:stacked?undefined:1,minWidth:0}}><Copy small>{label}</Copy></View><View style={{maxWidth:stacked?'100%':'55%',minWidth:0}}><Copy strong>{value}</Copy></View></View>;}
export function Notice({children,error=false,kind='warning'}:{children:React.ReactNode;error?:boolean;kind?:'info'|'success'|'warning'|'error'}){const {colors:c}=useTheme(),variant=error?'error':kind;return <View accessibilityLiveRegion="polite" style={{padding:16,borderRadius:16,backgroundColor:variant==='error'?c.errorContainer:variant==='warning'?c.warningContainer:c.primaryContainer}}><AmountTextContext.Provider value={[s.body,{color:variant==='error'?c.error:variant==='warning'?c.warning:c.onPrimaryContainer}]}><Text style={[s.body,{color:variant==='error'?c.error:variant==='warning'?c.warning:c.onPrimaryContainer}]}>{variant==='success'?common.completed:''}{children}</Text></AmountTextContext.Provider></View>;}
export function SectionRow({title,summary,onPress}:{title:string;summary:string;onPress:(returnFocus:()=>void)=>void}){const {colors:c}=useTheme(),node=useRef<View>(null);return <Pressable ref={node} accessibilityRole="button" accessibilityLabel={`${title}, ${summary}`} accessibilityHint={common.opensDetails} onPress={()=>{Keyboard.dismiss();onPress(()=>focusNative(node.current));}} style={({pressed})=>({paddingVertical:16,paddingHorizontal:4,borderBottomWidth:1,borderColor:c.divider,opacity:pressed?.7:1,gap:6})}><View style={s.row}><View style={{flex:1,minWidth:0}}><Copy strong>{title}</Copy></View><Copy>›</Copy></View><Copy small>{summary}</Copy></Pressable>;}
export function Page({children}:{children:React.ReactNode}){const {width,height,fontScale}=useWindowDimensions(),padding=layoutPolicy(width,height,fontScale).contentPadding;return <FormScope><ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={[s.page,{padding}]}>{children}</ScrollView></FormScope>;}
export function Sheet({visible,onClose,title,children,returnFocus}:{visible:boolean;onClose:()=>void;title:string;children:React.ReactNode;returnFocus?:()=>void}){
 const {colors:c,reducedMotion}=useTheme(),{width,height,fontScale}=useWindowDimensions(),insets=useSafeAreaInsets(),layout=layoutPolicy(width,height,fontScale);
 const offset=useRef(new Animated.Value(0)).current,slot=useRef(new TransitionSlot()).current,interfaceVisible=useInterfaceVisible(),heading=useRef<Text>(null),wasVisible=useRef(false),restore=useRef(returnFocus);restore.current=returnFocus;
 const shown=visible&&interfaceVisible,cover=useContext(CoverWorkspace);
 const settle=()=>{slot.stop();offset.stopAnimation();if(reducedMotion){offset.setValue(0);return;}const animation=Animated.spring(offset,{toValue:0,...motion.spring,useNativeDriver:true});slot.replace({start:()=>animation.start(),stop:()=>animation.stop()});};
 useEffect(()=>{if(wasVisible.current&&!shown&&interfaceVisible){const timer=setTimeout(()=>restore.current?.(),0);wasVisible.current=shown;return()=>clearTimeout(timer);}wasVisible.current=shown;},[shown,interfaceVisible]);
 useEffect(()=>{slot.stop();offset.stopAnimation();offset.setValue(shown&&!reducedMotion&&!layout.centerSheet?motion.sheet.entry:0);if(shown&&!reducedMotion&&!layout.centerSheet)settle();return()=>slot.stop();},[shown,reducedMotion,layout.centerSheet]);
 const drag=PanResponder.create({onMoveShouldSetPanResponderCapture:(_,g)=>!layout.centerSheet&&g.dy>motion.sheet.dragStart&&Math.abs(g.dy)>Math.abs(g.dx),onMoveShouldSetPanResponder:(_,g)=>!layout.centerSheet&&g.dy>motion.sheet.dragStart&&Math.abs(g.dy)>Math.abs(g.dx),onPanResponderGrant:()=>{slot.stop();offset.stopAnimation();},onPanResponderMove:(_,g)=>{if(!reducedMotion)offset.setValue(Math.max(0,g.dy));},onPanResponderRelease:(_,g)=>releaseSheetDrag(g.dy,settle,onClose),onPanResponderTerminate:settle});
 return <FormScope><Modal visible={shown} onShow={()=>focusNative(heading.current)} transparent animationType="none" onRequestClose={onClose}><KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1,justifyContent:layout.centerSheet?'center':'flex-end',alignItems:'center',backgroundColor:'#00000088',paddingTop:insets.top+16,paddingHorizontal:layout.centerSheet?24:0,paddingBottom:layout.centerSheet?insets.bottom+16:0}}><Pressable accessibilityRole="button" accessibilityLabel={common.closeDetails} onPress={onClose} style={{position:'absolute',top:0,left:0,right:0,bottom:0}}/><Animated.View accessibilityViewIsModal style={{width:'100%',maxWidth:layout.centerSheet?720:undefined,maxHeight:Math.max(120,height-insets.top-insets.bottom-32),backgroundColor:c.surface,borderTopLeftRadius:24,borderTopRightRadius:24,borderBottomLeftRadius:layout.centerSheet?24:0,borderBottomRightRadius:layout.centerSheet?24:0,padding:layout.sheetPadding,paddingBottom:layout.centerSheet?24:Math.max(24,insets.bottom+16),transform:[{translateY:offset}]}}>{!layout.centerSheet&&<View {...drag.panHandlers} onStartShouldSetResponder={()=>true} accessible accessibilityRole="button" accessibilityLabel={common.close+' '+title} accessibilityHint={common.closeHint} accessibilityActions={[{name:'activate',label:common.closeSection}]} onAccessibilityAction={event=>{if(event.nativeEvent.actionName==='activate')onClose();}} onAccessibilityTap={onClose} style={{alignItems:'center',justifyContent:'center',minHeight:44,padding:10}}><View style={{height:4,width:36,borderRadius:2,backgroundColor:c.outline}}/></View>}<View {...(!layout.centerSheet?drag.panHandlers:{})} style={[s.row,{paddingBottom:16}]}><View style={{flex:1,minWidth:0}}><Heading focusRef={heading}>{title}</Heading></View>{cover&&<Pressable accessibilityRole="button" accessibilityLabel={common.hideScreen} onPress={cover} style={{minWidth:48,minHeight:48,justifyContent:'center',alignItems:'center'}}><MaterialCommunityIcons name="eye-off-outline" size={24} color={c.text}/></Pressable>}<Pressable accessibilityRole="button" accessibilityLabel={'Close '+title} onPress={onClose} style={{minHeight:48,minWidth:48,justifyContent:'center',alignItems:'center',borderRadius:24,backgroundColor:c.container}}><Copy strong>×</Copy></Pressable></View><ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{gap:20}}>{children}<Button secondary title={common.close} onPress={onClose}/></ScrollView></Animated.View></KeyboardAvoidingView></Modal></FormScope>;
}
export function focusNative(target:any){const tag=findNodeHandle(target);if(tag)AccessibilityInfo.setAccessibilityFocus(tag);}

/** A short visible summary keeps the full caveats available on demand. */
export function HelpNote({summary,children}:{summary:string;children:React.ReactNode}){
 const [expanded,setExpanded]=useState(false),{colors:c}=useTheme();
 return <View style={{gap:8}}><Copy small>{summary}</Copy><Pressable accessibilityRole="button" accessibilityState={{expanded}} accessibilityHint={expanded?common.hidesDetail:common.showsDetail} onPress={()=>setExpanded(v=>!v)} style={{minHeight:44,justifyContent:'center'}}><Text style={{color:c.primary}}>{expanded?common.lessDetail:common.moreDetail}</Text></Pressable>{expanded&&<View style={{gap:8}}>{typeof children==='string'?<Copy small>{children}</Copy>:children}</View>}</View>;
}
/** Wrap Input rather than numeric Field: dates must retain the exact typed text.
 * FormScope blocks primary saves while a draft is invalid. Stored values stay ISO.
 */
export function DateField({label,value,onChange,kind='date',optional=false,onValidityChange}:{label:string;value:string;onChange:(value:string)=>void;kind?:'date'|'month'|'taxYear';optional?:boolean;onValidityChange?:(valid:boolean)=>void}){
 const display=(value:string)=>kind==='date'?dateInput(value):kind==='month'?monthInput(value):value?formatTaxYear(value):'';
 const parse=kind==='date'?parseUkDate:kind==='month'?parseUkMonth:parseTaxYear;
 const [raw,setRaw]=useState(()=>display(value)),[error,setError]=useState(''),editing=useRef(false),id=useId(),validation=useContext(Validation),update=useRef(validation.update);update.current=validation.update;
 const validity=useRef(onValidityChange);validity.current=onValidityChange;
 const message=kind==='date'?common.dateError:kind==='month'?common.monthError:common.taxYearError;
 const valid=(text:string)=>optional&&!text.trim()?'':parse(text);
 useEffect(()=>{if(!editing.current){setRaw(display(value));setError('');update.current(id,valid(display(value))===null);validity.current?.(valid(display(value))!==null);}},[value,kind,optional]);
 useEffect(()=>()=>update.current(id,false),[]);
 const change=(text:string)=>{setRaw(text);const next=valid(text);update.current(id,next===null);validity.current?.(next!==null);if(next!==null){onChange(next);setError('');}};
 const finish=()=>{editing.current=false;const next=valid(raw);setError(next===null?message:'');update.current(id,next===null);validity.current?.(next!==null);if(next!==null){onChange(next);setRaw(display(next));}};
 // Android uses the default keyboard because its numeric pad has no slash.
 return <Input label={label} value={raw} onChangeText={change} onFocus={()=>editing.current=true} onBlur={finish} onSubmitEditing={finish} error={error} placeholder={kind==='date'?common.datePlaceholder:kind==='month'?common.monthPlaceholder:common.taxYearPlaceholder} autoCorrect={false} autoCapitalize="none" keyboardType={kind==='taxYear'?'default':Platform.select({ios:'numbers-and-punctuation',default:'default'})}/>;
}
