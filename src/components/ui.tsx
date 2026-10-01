import Image from "next/image";
import type { ReactNode } from "react";
import { Icon } from "./icons";
import imageAssets from "@/content/images.json";

export function Brand() {
  return (
    <span className="brand">
      <Image
        src={imageAssets["/brand/nano-symbol.png"].variants[0].src}
        width={36}
        height={29}
        alt=""
        unoptimized
      />
      <Image
        className="wordmark"
        src={imageAssets["/brand/nano-wordmark-original.png"].variants[0].src}
        unoptimized
        alt="NANO"
        width={80}
        height={26}
      />
    </span>
  );
}
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="eyebrow">
      <span aria-hidden="true" />
      {children}
    </p>
  );
}
export function TextLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a className="text-link" href={href}>
      {children}
      <Icon name="arrow" />
    </a>
  );
}
export function DownloadLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a className={`button button-primary ${className}`} href={href}>
      <Icon name="windows" />
      {children}
      <Icon className="button-arrow" name="arrow" />
    </a>
  );
}
