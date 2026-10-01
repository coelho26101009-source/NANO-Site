import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  name:
    | "arrow"
    | "download"
    | "github"
    | "windows"
    | "shield"
    | "chevron"
    | "menu"
    | "close";
};
export function Icon({ name, ...props }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {name === "arrow" && (
        <>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </>
      )}
      {name === "download" && (
        <>
          <path d="M12 3v12m-5-5 5 5 5-5M5 16v4h14v-4" />
        </>
      )}
      {name === "github" && (
        <>
          <path
            d="M9 19c-4.3 1.3-4.3-2.2-6-2.7M15 22v-3.4c0-1 .1-1.6-.5-2.2 3.3-.4 6.7-1.6 6.7-7.3a5.7 5.7 0 0 0-1.5-4 5.3 5.3 0 0 0-.2-4.1s-1.3-.4-4.3 1.6a14.5 14.5 0 0 0-7.8 0C4.4.6 3.1 1 3.1 1a5.3 5.3 0 0 0-.2 4.1 5.7 5.7 0 0 0-1.5 4c0 5.7 3.4 6.9 6.7 7.3-.5.5-.7 1.1-.6 2.2V22"
            transform="translate(1 1) scale(.9)"
          />
        </>
      )}
      {name === "windows" && (
        <>
          <path
            d="m3 5 8-1v7H3zm10-1.2 8-1.1V11h-8zM3 13h8v7l-8-1zm10 0h8v8.3l-8-1.1z"
            fill="currentColor"
            stroke="none"
          />
        </>
      )}
      {name === "shield" && (
        <>
          <path d="m12 3 8 3v6c0 4-8 9-8 9s-8-5-8-9V6zM8 12l3 3 5-6" />
        </>
      )}
      {name === "chevron" && <path d="m6 9 6 6 6-6" />}
      {name === "menu" && <path d="M4 8h16M4 16h16" />}
      {name === "close" && <path d="m6 6 12 12M6 18 18 6" />}
    </svg>
  );
}
