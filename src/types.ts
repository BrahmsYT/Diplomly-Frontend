export type Role = 'LEARNER' | 'ORG_OWNER';
export type CertStatus = 'issued' | 'expired' | 'revoked';
export type Acceptance = 'pending' | 'accepted' | 'rejected';
export type Visibility = 'searchable' | 'only_me';

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: Role;
  organization?: {
    id: string;
    name: string;
    logo: string | null;
    headName: string | null;
  } | null;
}

export interface Certificate {
  id: string;
  uniqueCode: string;
  learnerName: string;
  learnerEmail: string;
  courseName: string;
  courseId: string | null;
  grade: string | null;
  organizationId: string;
  organizationName: string;
  headName: string | null;
  issueDate: string;
  expiryDate: string | null;
  additionalText: string | null;
  status: CertStatus;
  statusLabel: string;
  acceptance: Acceptance;
  public: boolean;
  visibility: Visibility;
  isClaimed: boolean;
  publicUrl: string;
  createdAt: string;
}

/** Ucuncu sexslere gosterilen mehdud gorunus - e-mail daxil deyil. */
export interface PublicCertificate {
  uniqueCode: string;
  learnerName: string;
  courseName: string;
  grade: string | null;
  organizationName: string;
  headName: string | null;
  issueDate: string;
  expiryDate: string | null;
  additionalText: string | null;
  status: CertStatus;
  statusLabel: string;
  publicUrl: string;
}

export interface Course {
  id: string;
  name: string;
  certificateCount: number;
  createdAt?: string;
}

export interface Organization {
  id: string;
  name: string;
  logo: string | null;
  website: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  headName: string | null;
  certificateCount: number;
  courseCount: number;
  owner: { name: string; surname: string; email: string };
}

export interface OrganizationStats {
  total: number;
  thisMonth: number;
  active: number;
  expired: number;
  revoked: number;
  recent: Array<{
    uniqueCode: string;
    learnerName: string;
    courseName: string;
    issueDate: string;
    status: string;
  }>;
}

export interface LearnerStats {
  total: number;
  active: number;
  expired: number;
  revoked: number;
  pending: number;
}

export interface LearnerLookup {
  found: boolean;
  source?: 'user' | 'certificate';
  id?: string | null;
  name?: string;
  surname?: string;
  email: string;
}

export type VerifyResult =
  | {
      type: 'code';
      result: 'verified' | 'revoked';
      message: string;
      certificate: PublicCertificate;
    }
  | { type: 'code'; result: 'not_found'; message: string; hint: string }
  | {
      type: 'email';
      result: 'found' | 'not_found';
      message: string;
      count: number;
      certificates: PublicCertificate[];
    };

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
