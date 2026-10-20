/** Exact existing gallery/auxiliary banner variants; Figma heights are not applied to auto-height roots. */
export type BannerVariant='helper'|'ghost'|'info'|'pending'|'user-event'
/** Original library references; legacy extraction IDs remain on the web exports. */
export const BANNER_ORIGINAL_SOURCES = {
 helper: { sourceNodeId: '715:6940', sourceNodeIds: { plain: '715:6936', withLink: '715:6941' } },
 ghost: { sourceNodeId: '1517:13357', sourceNodeIds: { default: '265:6489' } },
 info: { sourceNodeId: '1517:13357', sourceNodeIds: { homepage: '265:6419', investmentEmpty: '1944:3100' } },
 pending: { sourceNodeId: '1517:12788', sourceNodeIds: { default: '1518:3742' } },
 'user-event': { sourceNodeId: '1517:12696', sourceNodeIds: { compact: '1517:12697', full: '9104:14367' } },
} as const
export function resolveBanner({variant,interactive=false,layout='horizontal',hasAction=false,dismissible=false,showOptions=false}: {variant:BannerVariant;interactive?:boolean;layout?:'horizontal'|'stacked';hasAction?:boolean;dismissible?:boolean;showOptions?:boolean}) {
 const helper=variant==='helper',user=variant==='user-event',pending=variant==='pending',stacked=variant==='ghost'&&layout==='stacked'
 return {variant,rootTag:(variant==='ghost'||pending)&&interactive?'button':'div',width:helper||user?343:327,height:pending?157:undefined,radius:helper?4:8,gap:8,messageGap:helper||user?0:4,padding:pending?24:16,align:helper||user&&!hasAction?'center':'start',slotSize:user?48:32,iconSize:user?24:20,titleFontSize:user?14:stacked?12:pending?24:18,titleLineHeight:user?15:stacked?16:pending?26:20,bodyFontSize:helper||pending?18:user?14:16,bodyLineHeight:helper?20:pending?22:user?15:18,hasAction,dismissible,showOptions,closeSlot:24,closeGlyph:12,dismissMode:'external',pendingGradient:'linear-gradient(90deg, #007A91 0%, #44909E 100%)'} as const
}
