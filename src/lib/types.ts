export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

export type AuthorRef = {
  id: string;
  email: string;
  role: string;
};

export type ThumbnailRef = {
  id: string;
  url: string;
  mimeType: string;
  filename: string;
  originalName: string | null;
} | null;

export type NewsRow = {
  id: string;
  title: string;
  slug: string | null;
  body: string;
  publishedAt: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: AuthorRef;
  thumbnail: ThumbnailRef;
};

export type EventRow = {
  id: string;
  title: string;
  slug: string | null;
  body: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  publishedAt: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: AuthorRef;
  thumbnail: ThumbnailRef;
};

export type UploadedFileResponse = {
  id: string;
  filename: string;
  originalName: string | null;
  url: string;
  mimeType: string;
  size: number;
};

export type CareerQuizOptionRow = {
  id: string;
  label: string;
  title: string;
  description: string;
  /** Present on admin API; omitted on `GET /career-quiz/published` so visitors cannot see the key. */
  isCorrect?: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CareerQuizQuestionRow = {
  id: string;
  quizId: string;
  stepOrder: number;
  categoryLabel: string;
  questionText: string;
  imageFileId: string | null;
  quoteText: string | null;
  quoteIconKey: string | null;
  createdAt: string;
  updatedAt: string;
  imageFile: ThumbnailRef;
  options: CareerQuizOptionRow[];
};

export type CareerQuizRow = {
  id: string;
  title: string;
  description: string | null;
  displayTotalSteps: number | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  questions: CareerQuizQuestionRow[];
};

/** Must match API `faculty-program-icons` presets. */
export type FacultyProgramIconKey =
  | "cardiac"
  | "cardiology"
  | "psw"
  | "medical_admin"
  | "clinical_assistant"
  | "science"
  | "generic";

export type FacultyProgramRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string | null;
  iconKey: FacultyProgramIconKey | string;
  imageFile: ThumbnailRef;
  duration: string | null;
  credentialType: string | null;
  format: string | null;
  practicumHours: number | null;
  admissionRequirements: string[];
  clinicalRequirements: string[];
  acceptingApplications: boolean;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdmissionsContent = {
  introHtml: string | null;
  generalRequirements: string[];
};

export type TourBookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export type TourBookingRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  visitAt: string;
  status: TourBookingStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProgramApplicationStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "INTERVIEW_SCHEDULED"
  | "OFFER_SENT"
  | "ACCEPTED"
  | "ENROLLED"
  | "DECLINED"
  | "WITHDRAWN";

export type ProgramApplicationDocumentType =
  | "transcript"
  | "government_id"
  | "credentials"
  | "police_check"
  | "immunization"
  | "cpr_certification"
  | "other";

export type ProgramApplicationListRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  citizenship: string;
  preferredStartDate: string;
  facultyProgramId: string | null;
  status: ProgramApplicationStatus;
  adminNotes: string | null;
  interviewScheduledAt: string | null;
  interviewNotes: string | null;
  enrolledAt: string | null;
  createdAt: string;
  updatedAt: string;
  facultyProgram: { id: string; title: string; slug?: string } | null;
  _count: { attachments: number };
};

export type ProgramApplicationAttachmentRow = {
  id: string;
  applicationId: string;
  storedFileId: string;
  documentType: ProgramApplicationDocumentType | string;
  storedFile: {
    id: string;
    originalName: string | null;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
  };
};

export type ProgramApplicationDetail = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  citizenship: string;
  preferredStartDate: string;
  facultyProgramId: string | null;
  status: ProgramApplicationStatus;
  adminNotes: string | null;
  interviewScheduledAt: string | null;
  interviewNotes: string | null;
  enrolledAt: string | null;
  createdAt: string;
  updatedAt: string;
  facultyProgram: {
    id: string;
    title: string;
    slug?: string;
    description: string;
    iconKey: string;
  } | null;
  attachments: ProgramApplicationAttachmentRow[];
};

export type ProgramApplicationSubmitResponse = {
  id: string;
  trackingToken: string;
  createdAt: string;
};

export type ProgramApplicationTrackResponse = {
  id: string;
  status: ProgramApplicationStatus;
  preferredStartDate: string;
  interviewScheduledAt: string | null;
  enrolledAt: string | null;
  createdAt: string;
  updatedAt: string;
  facultyProgram: { id: string; title: string; slug: string } | null;
};

export type ProfileBundle = {
  user: {
    id: string;
    email: string;
    role: string;
  };
  profile: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
    applicant: unknown;
    student: unknown;
  };
};
