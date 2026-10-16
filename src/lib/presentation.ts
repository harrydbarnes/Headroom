/** Shared presentation policy, independent of native rendering. Dimensions are logical pixels. */
export const motion={duration:{short:140,screen:180,privacy:200},spring:{damping:28,stiffness:280,mass:1},sheet:{entry:24,dismissDistance:100,dragStart:8}} as const;
export function layoutPolicy(width:number,height:number,fontScale=1){
 const scale=Math.max(1,fontScale),rail=width>=840&&height>=420;
 return {rail,railWidth:Math.max(96,Math.min(160,96*scale)),stackValues:width/scale<380,centerSheet:width>=720&&height>=600,sheetPadding:width<380?16:24,contentPadding:width<380?16:24};
}
export function columnCount(available:number,fontScale=1,minPane=340){return available>=minPane*2*Math.max(1,fontScale)+24?2:1;}
/** Keep all destinations discoverable when scaled labels cannot fit in one bottom bar. */
export function navigationNeedsMenu(width:number,fontScale:number,destinations:number){return destinations*Math.max(64,64*fontScale)+8>width;}
export const typeRoles={display:{fontSize:42,lineHeight:50,fontWeight:'600' as const},headline:{fontSize:28,lineHeight:36,fontWeight:'600' as const},title:{fontSize:20,lineHeight:28,fontWeight:'600' as const},body:{fontSize:16,lineHeight:24,fontWeight:'400' as const},label:{fontSize:14,lineHeight:20,fontWeight:'600' as const},caption:{fontSize:13,lineHeight:20,fontWeight:'400' as const}};
/** Each transition owns its cancellation handle. Cleanup always precedes a replacement. */
export class TransitionSlot{private active:{stop:()=>void}|null=null;replace(next:{start:()=>void;stop:()=>void}|null){this.stop();this.active=next;next?.start();}stop(){this.active?.stop();this.active=null;}}
