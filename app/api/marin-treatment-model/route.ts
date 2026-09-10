import {calculate} from '@/lib/marin-treatment-model.mjs';
import report from '@/data/bay/marin-treatment-report.json';

export function GET() {
  return Response.json({
    modelVersion: report.modelVersion,
    interpretation: 'Conditional judgmental ordinary-gift model, not a verified marginal funding offer. SF residence share and marginal gross resources are unknown.',
    evaluated: calculate(),
  });
}
