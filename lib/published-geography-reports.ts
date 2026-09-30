import data from '@/data/geography-reports.json';
import progress from '@/docs/geography-progress.json';
import {validateEditionReports} from './geography-reports.mjs';

export type IncomePathway={people:number;annualIncomeBeforeUSD:number;annualIncomeGainUSD:number;years:number;causalShare:number;editionShare:number;independentShare:number;delayYears?:number;discountRate?:number;sourceIds:string[];rationale:string;counterfactual:string};

export type EditionReport={
 edition:string;boundaryVersion:string;organizationId:string;slug:string;organization:string;program:string;
 published:string;updated:string;stage:'alpha'|'beta';donationUrl:string|null;
 priceScope?:string;
 summary:{what:string[];strengths:string[];reservations:string[]};sections:Record<string,string>;
 sources:{id:string;title:string;publisher:string;url:string;published:string|null;retrieved:string}[];
 model:{version:string;costScope:string;geographicAttribution:string;formula:string;counterfactual:string;attribution:string;uncertainty:string;nativeOutcomes:string;inputs:{name:string;value:unknown;unit:string;basis:string;rationale:string;sourceIds:string[]}[];scenarios:{id:string;label:string;costUSD:number|null;allPopulationQalys:number|null;editionQalys:number|null;assumptions:string;incomePathways?:IncomePathway[]}[];sensitivity:string[];missingInputs:string[];incomeBridge?:IncomePathway};
 annualExpenses:{year:number;amount:number;currency:string;periodMonths:number|null;comparable:boolean;entity:string;accountingBasis:string;sourceId:string}[];
 timeCoverage:'partial'|'complete';sessionIds:string[];acceptance:{status:string;evidence:string};
};
validateEditionReports(data,progress);
export const reportRegistry=data;
export const publishedEditionReports=data.reports as EditionReport[];
export function getEditionReport(edition:string,slug:string){return publishedEditionReports.find(r=>r.edition===edition&&r.slug===slug);}
