type Props = {
  iconKey: string;
  className?: string;
};

const gold = "text-amber-400";

/** Small gold-line icons for faculty cards (preset keys from the API). */
export function FacultyProgramIcon({ iconKey, className = "h-8 w-8" }: Props) {
  switch (iconKey) {
    case "cardiac":
      return (
        <svg
          className={`${className} ${gold}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M12 21s-6-4.35-8-8.5C2 8.5 4.5 5 8 5c1.5 0 3 1 4 2.5C13 6 14.5 5 16 5c3.5 0 6 3.5 4 7.5C18 16.65 12 21 12 21z" />
          <path d="M8 12h2l1.5 2L14 9h2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "cardiology":
      return (
        <svg
          className={`${className} ${gold}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <rect x="3" y="4" width="18" height="14" rx="2" />
          <path d="M7 15v-4M12 15V9M17 15v-6" strokeLinecap="round" />
        </svg>
      );
    case "psw":
      return (
        <svg
          className={`${className} ${gold}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M12 3l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7l8-4z" />
          <path d="M9 12h6M12 9v6" strokeLinecap="round" />
        </svg>
      );
    case "medical_admin":
      return (
        <svg
          className={`${className} ${gold}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M6 4h12v16H6z" />
          <path d="M9 8h6M9 12h6M9 16h4" strokeLinecap="round" />
        </svg>
      );
    case "clinical_assistant":
      return (
        <svg
          className={`${className} ${gold}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M8 4h8v4H8z" />
          <path d="M10 8v12M14 8v12" strokeLinecap="round" />
          <path d="M6 12h12M6 16h12" strokeLinecap="round" />
        </svg>
      );
    case "science":
      return (
        <svg
          className={`${className} ${gold}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M9 3h6v18H9z" />
          <path d="M5 7h14M5 17h14" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg
          className={`${className} ${gold}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12h8M12 8v8" strokeLinecap="round" />
        </svg>
      );
  }
}
