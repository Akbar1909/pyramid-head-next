import { getTranslations } from "next-intl/server";
import { FacultyProgramForm } from "@/components/faculty-program-form";
import { Link } from "@/i18n/navigation";

export default async function NewFacultyProgramPage() {
  const t = await getTranslations("DashboardFaculty");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <p className="text-base">
        <Link
          href="/dashboard/faculty"
          className="font-medium text-amber-800 hover:text-amber-900"
        >
          {t("backToList")}
        </Link>
      </p>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
        {t("newTitle")}
      </h2>
      <FacultyProgramForm mode="create" />
    </div>
  );
}
