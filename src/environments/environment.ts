
import { environment as prodEnv } from './environment.prod';
import { environment as stgEnv } from './environment.stg';

const isProduction  = true;

export const environment = isProduction ? prodEnv : stgEnv;