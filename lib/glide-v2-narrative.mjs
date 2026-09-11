import report from '../data/san-francisco/glide-v2-report.json' with {type:'json'};
import {headingId} from './report-markdown.mjs';
const anchors=new Map(report.longForm.sections.map(s=>[s.id,headingId(s.title)]));
export const markdown=('## Summary\n\n'+report.longForm.summary+'\n\n'+report.longForm.sections.map(s=>'## '+s.title+'\n\n'+s.markdown).join('\n\n')).replace(/\]\(#([^)]*)\)/g,(match,id)=>'](#'+(anchors.get(id)??id)+')');
