import data from '@/data/geography-reports.json';
import progress from '@/docs/geography-progress.json';
import {validateEditionReports} from './geography-reports.mjs';

export type EditionReport={
 edition:string;boundaryVersion:string;organizationId:string;slug:string;organization:string;program:string;
 published:string;updated:string;stage:'alpha'|'beta';donationUrl:string|null;
 summary:{what:string[];strengths:string[];reservations:string[]};sections:Record<string,string>;
 sources:{id:string;title:string;publisher:string;url:string;published:string|null;retrieved:string}[];
 model:{version:string;costScope:string;geographicAttribution:string;formula:string;counterfactual:string;attribution:string;uncertainty:string;nativeOutcomes:string;inputs:{name:string;value:unknown;unit:string;basis:string;rationale:string;sourceIds:string[]}[];scenarios:{id:string;label:string;costUSD:number|null;allPopulationQalys:number|null;editionQalys:number|null;assumptions:string}[];sensitivity:string[];missingInputs:string[]};
 annualExpenses:{year:number;amount:number;currency:string;periodMonths:number|null;comparable:boolean;entity:string;accountingBasis:string;sourceId:string}[];
 timeCoverage:'partial'|'complete';sessionIds:string[];acceptance:{status:string;evidence:string};
};
validateEditionReports(data,progress);
export const reportRegistry=data;
export const publishedEditionReports=data.reports as EditionReport[];
export function getEditionReport(edition:string,slug:string){return publishedEditionReports.find(r=>r.edition===edition&&r.slug===slug);}
