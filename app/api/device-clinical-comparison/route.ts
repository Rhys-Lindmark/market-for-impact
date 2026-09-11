import {compare} from '@/lib/device-clinical-comparison.mjs';
export function GET(){return Response.json(compare());}
