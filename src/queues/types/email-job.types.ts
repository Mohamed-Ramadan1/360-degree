export interface BaseEmailJob {
  type: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}
