// Exact production reportPrice/scenarioIncomeEquivalent logic, portable packet import.
import {incomeHealthyYearEquivalent} from './income-health-equivalence.mjs';
export function reportPrice(report){const s=report.model.scenarios.find(s=>s.id==='central');if(!s||!(s.costUSD>0)||!Number.isFinite(s.editionQalys))return null;if(s.incomeUnknown===true)return null;const income=scenarioIncomeEquivalent(s)??(report.model.incomeBridge?incomeHealthyYearEquivalent(report.model.incomeBridge):0);const total=s.editionQalys+income;return total>0?10*s.costUSD/total:null;}
export function scenarioIncomeEquivalent(s){return s.incomeUnknown===true||s.incomePathways===undefined?null:s.incomePathways.reduce((sum,p)=>sum+incomeHealthyYearEquivalent(p),0);}

