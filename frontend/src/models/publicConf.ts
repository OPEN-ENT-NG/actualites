export const DEFAULT_FALC_MIN_LENGTH = 200;
export const DEFAULT_FALC_TIMEOUT_MS = 30000;

export interface PublicConf {
  'screeb-app-id'?: string;
  'genai'?: { falcMinLength: number; falcTimeoutMs: number };
}
