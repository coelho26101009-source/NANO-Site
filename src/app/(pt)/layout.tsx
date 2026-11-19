import { Document } from "@/components/document";
import { buildMetadata } from "@/lib/page-metadata";

export const metadata = buildMetadata("pt");
export { viewport } from "@/lib/page-metadata";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <Document locale="pt">{children}</Document>;
}
