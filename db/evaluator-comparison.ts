import snapshot from '@/data/comparisons/evaluator-matrix-v1.json';
import { getAceMarket } from '@/db/ace';
import { getAllCoefficientGrants } from '@/db/coefficient-all';
import { getFoundersPledgeMatrix } from '@/db/founders-pledge';
import { getGiveWellMarket } from '@/db/givewell';
import { getGivingGreenMarket } from '@/db/giving-green';

export async function getEvaluatorComparison() {
  const coefficient = await getAllCoefficientGrants({ fund: null, year: null, query: '', sort: 'recent', page: 1, pageSize: 1 });
  const givewell = await getGiveWellMarket();
  const ace = await getAceMarket();
  const givingGreen = await getGivingGreenMarket();
  const foundersPledge = await getFoundersPledgeMatrix();

  const cell = (cause: string, evaluator: string) => snapshot.causes.find((item) => item.key === cause)?.cells.find((item) => item.evaluatorKey === evaluator);
  const fundByName = new Map(coefficient.funds.map((fund) => [fund.fund, fund]));
  for (const cause of snapshot.causes) {
    const coefficientCell = cause.cells.find((item) => item.evaluatorKey === 'coefficient');
    for (const lens of coefficientCell?.fundLenses ?? []) {
      const row = fundByName.get(lens.fund);
      if (!row || row.grantCount !== lens.grantCount || row.publishedAmountUsd !== lens.publishedAmountUsd) {
        throw new Error(`Coefficient comparison lens failed D1 reconciliation: ${lens.fund}`);
      }
    }
  }
  const aceFundingRoom = ace.recommendations.reduce((sum, item) => sum + Number(item.funding_room_usd ?? 0), 0);
  const givingGreenAmount = givingGreen.grants.reduce((sum, item) => sum + Number(item.amount_usd ?? 0), 0);
  const fpCount = (cause: string) => foundersPledge.opportunities.filter((item) => item.cause === cause).length;
  if (givewell.opportunities.length !== cell('global-health', 'givewell')?.recommendationCount) throw new Error('GiveWell comparison failed D1 reconciliation.');
  if (ace.recommendations.length !== cell('animal-welfare', 'ace')?.recommendationCount || aceFundingRoom !== cell('animal-welfare', 'ace')?.numericFundingRoomUsd) throw new Error('ACE comparison failed D1 reconciliation.');
  if (givingGreen.recommendations.length !== cell('climate', 'giving-green')?.recommendationCount || givingGreen.grants.length !== cell('climate', 'giving-green')?.publishedGrantCount || givingGreenAmount !== cell('climate', 'giving-green')?.publishedAmountUsd) throw new Error('Giving Green comparison failed D1 reconciliation.');
  if (foundersPledge.opportunities.length !== 12 || fpCount('Education') !== cell('education', 'founders-pledge')?.recommendationCount || fpCount('Global health') !== cell('global-health', 'founders-pledge')?.recommendationCount || fpCount('Global catastrophic risks') !== 7) throw new Error('Founders Pledge comparison failed D1 reconciliation.');

  return {
    ...snapshot,
    database: {
      status: 'reconciled',
      checkedEvaluatorCount: 5,
      sourceFreshness: {
        coefficient: coefficient.source.retrievedAt,
        givewell: givewell.source.retrievedAt,
        ace: ace.source.retrievedAt,
        givingGreen: givingGreen.source.retrievedAt,
        foundersPledge: foundersPledge.retrievedAt,
      },
    },
  };
}
