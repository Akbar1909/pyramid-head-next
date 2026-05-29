import { fetchPublishedFacultyPrograms } from "@/lib/faculty-programs-server";
import { FacultyProgramsCarousel } from "./faculty-programs-carousel";

export async function FacultyProgramsSection() {
  const programs = await fetchPublishedFacultyPrograms();
  if (programs.length === 0) {
    return null;
  }
  return <FacultyProgramsCarousel programs={programs} />;
}
