'use client';
import {useEffect,useRef,useState} from 'react';

export type CityImpactRow={key:string;city:string;cityLabel:string;organization:string;href:string;costPerDaly:number;budget:number|null;budgetKind:string;budgetLabel:string;budgetNote:string;period:string};
const colors:Record<string,string>={'san-francisco':'#2377b7','new-york-city':'#d27621','los-angeles':'#27844b',chicago:'#b83f87',houston:'#7652b5',denver:'#198b8c'};
const money=(v:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',maximumSignificantDigits:3}).format(v);
const count=(v:number)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(v);
export default function CityImpactComparison({rows}:{rows:CityImpactRow[]}){
 const container=useRef<HTMLDivElement>(null),[width,setWidth]=useState(680),[selected,setSelected]=useState(rows.find(r=>r.organization==='Self-Help for the Elderly')??rows[0]);
 const cityEntries=[...new Map(rows.map(r=>[r.city,r.cityLabel])).entries()];
 const [visible,setVisible]=useState(()=>new Set(cityEntries.map(([city])=>city)));
 useEffect(()=>{const node=container.current;if(!node)return;const observer=new ResizeObserver(([entry])=>setWidth(entry.contentRect.width));observer.observe(node);return ()=>observer.disconnect();},[]);
 const known=rows.filter(r=>r.budget!==null&&r.budget>0).sort((a,b)=>a.costPerDaly-b.costPerDaly||a.organization.localeCompare(b.organization));
 let total=0;const plotted=known.map(r=>{const start=total;total+=r.budget!/1e6;return {...r,start,end:total};});
 const left=68,right=14,top=24,bottom=340,height=413,plotWidth=Math.max(1,width-left-right);
 const maximum=Math.max(...rows.map(r=>1e6/r.costPerDaly))*1.08;
 const x=(v:number)=>left+v/Math.max(total,1)*plotWidth,y=(v:number)=>bottom-v/maximum*(bottom-top);
 const tickCount=width<440?4:6,ticks=Array.from({length:tickCount},(_,i)=>i/(tickCount-1));
 const yStep=maximum>20?10:maximum>5?5:1,yTicks=Array.from({length:Math.floor(maximum/yStep)+1},(_,i)=>i*yStep);
 const details=(r:CityImpactRow)=>`${r.cityLabel} — ${r.organization}: ${money(r.costPerDaly)}/DALY; ${r.budget?money(r.budget)+'/year, '+r.budgetLabel:'annual budget unavailable'}. ${r.period}. ${r.budgetNote}`;
 function inspect(event:React.PointerEvent<SVGRectElement>){const b=event.currentTarget.ownerSVGElement!.getBoundingClientRect(),px=event.clientX-b.left,value=(px-left)/plotWidth*total;const row=plotted.find(r=>value>=r.start&&value<=r.end);if(row&&visible.has(row.city))setSelected(row);}
 return <div className="city-impact-comparison" ref={container}>
  <div className="city-impact-legend" aria-label="City colors">{cityEntries.map(([city,label])=><button key={city} type="button" aria-pressed={visible.has(city)} onClick={()=>setVisible(old=>{const next=new Set(old);next.has(city)?next.delete(city):next.add(city);return next;})}><span style={{background:colors[city]}} aria-hidden="true"/>{label}</button>)}</div>
  <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="city-impact-title city-impact-desc">
   <title id="city-impact-title">Top four nonprofits in each city, with annual-size widths and DALYs-per-dollar heights</title>
   <desc id="city-impact-desc">All cities share linear axes. Each rectangle width is an annual expense figure or explicitly labeled estimate. Its area is an illustrative annual DALY extrapolation, not a measured organization outcome. Asterisks identify estimated or historical proxy widths. The table below lists every nonprofit, source basis and fiscal period.</desc>
   {yTicks.map(v=><g key={v}><line x1={left} x2={width-right} y1={y(v)} y2={y(v)} stroke="var(--gb-rule)"/><text x={left-8} y={y(v)+4} textAnchor="end">{v}</text></g>)}
   <rect x={left} y={top} width={plotWidth} height={bottom-top} fill="none" stroke="var(--gb-rule)"/>
   {plotted.map(r=><rect key={r.key} data-city-rectangle={r.key} data-budget-kind={r.budgetKind} x={x(r.start)} y={y(1e6/r.costPerDaly)} width={x(r.end)-x(r.start)} height={bottom-y(1e6/r.costPerDaly)} fill={colors[r.city]} opacity={visible.has(r.city)?.72:0}><title>{details(r)}</title></rect>)}
   {ticks.map(t=><g key={t}><line x1={x(total*t)} x2={x(total*t)} y1={bottom} y2={bottom+5} stroke="var(--gb-rule)"/><text x={x(total*t)} y={bottom+22} textAnchor={t===0?'start':t===1?'end':'middle'}>{money(total*t*1e6)}</text></g>)}
   <text className="axis-title" data-axis="x" x={(left+width-right)/2} y={height-10} textAnchor="middle">{width<440?'Annual expenses / budget ($/yr)':'Cumulative annual expenses / budget ($/year)'}</text>
   <text className="axis-title" data-axis="y" transform={`translate(16,${(top+bottom)/2}) rotate(-90)`} textAnchor="middle">Modeled DALYs per $1M</text>
   <rect x={left} y={top} width={plotWidth} height={bottom-top} fill="transparent" onPointerMove={inspect} onPointerDown={inspect}/>
  </svg>
  <p className="city-impact-selected" aria-live="polite"><strong>{selected.cityLabel} — {selected.organization}</strong><br/>{selected.budget?`${money(selected.budget)}/year · ${selected.budgetLabel} · ${selected.period} · ${count(selected.budget/selected.costPerDaly)} illustrative DALYs/year`:'Annual budget unavailable'}</p>
  <div className="city-impact-table-wrap"><table><caption>All 24 picks, ordered by modeled $/DALY. ~ marks a planning estimate or historical proxy.</caption><thead><tr><th>City / nonprofit</th><th>Annual size figure</th><th>$/DALY</th><th>Basis and period</th></tr></thead><tbody>{[...rows].sort((a,b)=>a.costPerDaly-b.costPerDaly).map(r=><tr key={r.key}><th scope="row"><span className="city-impact-city" style={{borderColor:colors[r.city]}}>{r.cityLabel}</span><a href={r.href}>{r.organization}</a></th><td>{r.budget?(['estimate','historical-proxy'].includes(r.budgetKind)?'~':'')+money(r.budget):'Unavailable'}</td><td>{money(r.costPerDaly)}</td><td>{r.budgetLabel}. {r.period}. {r.budgetNote}</td></tr>)}</tbody></table></div>
 </div>;
}
