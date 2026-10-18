import {createCurrentPreventionModel} from './prevention-current-model.mjs';
import {calculate as firstCalibration} from './compass-first-health-income-model.mjs';
const model=createCurrentPreventionModel('compass',firstCalibration);
export const {modelVersion,central,calculate,scenarios,diagnostics,sharedSupportLoading}=model;
