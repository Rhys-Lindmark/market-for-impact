import {impactText} from './impact-metric.mjs';
export function impactMetadata(value){if(typeof value==='string')return /^https?:\/\//.test(value)?value:impactText(value);if(Array.isArray(value))return value.map(impactMetadata);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,impactMetadata(v)]));return value;}
