import model from '@/data/san-francisco/larkin-cash-housing-cea-v1.json';
import { cashHousingModel } from '@/lib/cash-housing-model.mjs';
export function GET() { return Response.json({...model, evaluatedScenarios:model.scenarios.map(s=>({...s,...cashHousingModel(s)}))}); }
