import data from '@/data/research-expenses.json';
import {expenseSummary} from '@/lib/research-expenses.mjs';
export function GET() {
 return Response.json({...data,organizations:Object.fromEntries(Object.entries(data.organizations).map(([slug,record])=>[slug,{...record,averageAnnualExpenses:expenseSummary(record).average}]))});
}
