import {createCurrentPreventionModel} from './prevention-current-model.mjs';
import {calculate as firstCalibration} from './hamilton-first-health-income-model.mjs';
const model=createCurrentPreventionModel('hamilton',firstCalibration);
export const {modelVersion,central,calculate,scenarios,diagnostics,sharedSupportLoading}=model;
