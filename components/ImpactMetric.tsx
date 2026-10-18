import {Fragment,cloneElement,isValidElement,type ReactNode,type ReactElement} from 'react';
import {impactTextEdits,impactText,legacyImpactText} from '@/lib/impact-metric.mjs';

/** Preserve links/markup while applying display-only edits across adjacent text leaves. */
export function impactNode(node:ReactNode,priceOnly=false):ReactNode{
 const leaves:string[]=[];
 const collect=(n:ReactNode)=>{if(typeof n==='string')leaves.push(legacyImpactText(n));else if(Array.isArray(n))n.forEach(collect);else if(isValidElement(n)&&(typeof n.type==='string'||n.type===Fragment))collect((n.props as {children?:ReactNode}).children);};
 collect(node);const text=leaves.join(''),edits=impactTextEdits(text,{priceOnly});let offset=0;
 const visit=(n:ReactNode):ReactNode=>{
  if(typeof n==='string'){
   n=legacyImpactText(n);
   const start=offset,end=start+n.length;offset=end;let out='',at=start;
   for(const e of edits){if(e.end<=start||e.start>=end)continue;out+=text.slice(at,Math.max(at,e.start));if(e.start>=start)out+=e.text;at=Math.min(end,e.end);}
   return out+text.slice(at,end);
  }
  if(Array.isArray(n))return n.map((child,index)=>{const next=visit(child);return isValidElement(next)&&next.key===null?cloneElement(next as ReactElement<Record<string,unknown>>,{key:'impact-'+index}):next;});
  if(isValidElement(n)&&(typeof n.type==='string'||n.type===Fragment)){
   const props=n.props as {children?:ReactNode;title?:string;'aria-label'?:string};
   return cloneElement(n as ReactElement<Record<string,unknown>>,{
    ...(props.title?{title:impactText(props.title)}:{}),...(props['aria-label']?{'aria-label':impactText(props['aria-label'])}:{}),
    children:visit(props.children),
   });
  }
  return n;
 };return visit(node);
}
