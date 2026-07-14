export interface ContactRequest {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  message: string;
  solutionInterest?: string;
}

export interface ContactResponse {
  ok: boolean;
  requestId?: string;
  message?: string;
}

export interface PageMeta {
  title: string;
  description: string;
}
