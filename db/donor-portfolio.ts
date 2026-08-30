import contract from '@/data/comparisons/portfolio-contract-v1.json';
import { getFundingTranches } from '@/db/funding-tranches';
import { buildDonorPortfolio } from '@/scripts/lib/portfolio-builder.mjs';

export type DonorPortfolioInput = {
  budgetUsd: number;
  causeWeights: Record<string, number>;
  riskTolerance: string;
  minimumEvidence: string;
  geography: string;
  liquidity: string;
  timeHorizon: string;
};

export async function getDonorPortfolio(input: DonorPortfolioInput) {
  const market = await getFundingTranches();
  return buildDonorPortfolio(contract, market.tranches, input);
}
