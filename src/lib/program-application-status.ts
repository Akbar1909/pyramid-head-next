"use client";

import { useTranslations } from "next-intl";
import type { ProgramApplicationStatus } from "@/lib/types";

export function useProgramApplicationStatusLabel() {
  const t = useTranslations("ApplicationStatus");

  return function statusLabel(s: ProgramApplicationStatus): string {
    switch (s) {
      case "SUBMITTED":
        return t("submitted");
      case "UNDER_REVIEW":
        return t("underReview");
      case "INTERVIEW_SCHEDULED":
        return t("interviewScheduled");
      case "OFFER_SENT":
        return t("offerSent");
      case "ACCEPTED":
        return t("accepted");
      case "ENROLLED":
        return t("enrolled");
      case "DECLINED":
        return t("declined");
      case "WITHDRAWN":
        return t("withdrawn");
      default:
        return s;
    }
  };
}

export const ALL_PROGRAM_APPLICATION_STATUSES: ProgramApplicationStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "INTERVIEW_SCHEDULED",
  "OFFER_SENT",
  "ACCEPTED",
  "ENROLLED",
  "DECLINED",
  "WITHDRAWN",
];
