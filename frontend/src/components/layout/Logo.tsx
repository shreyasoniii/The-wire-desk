import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-lg font-bold text-ink hover:text-primary-dark"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-primary">
        <path
          d="M4 8.5C8.5 4 15.5 4 20 8.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M7 12C9.8 9 14.2 9 17 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="16.5" r="1.8" fill="currentColor" />
      </svg>
      The Wire Desk
    </Link>
  );
}
