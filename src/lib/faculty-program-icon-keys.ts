/** Keep in sync with `pyramid-api-nestjs/src/faculty-programs/faculty-program-icons.ts`. */
export const FACULTY_PROGRAM_ICON_KEYS = [
  "cardiac",
  "cardiology",
  "psw",
  "medical_admin",
  "clinical_assistant",
  "science",
  "generic",
] as const;

export type FacultyProgramIconKeyConst =
  (typeof FACULTY_PROGRAM_ICON_KEYS)[number];
