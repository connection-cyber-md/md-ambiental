import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SocialRail } from "@/components/layout/SocialRail";
import { FloatingWhatsAppButton } from "@/components/layout/FloatingWhatsAppButton";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <SocialRail />
      <main>{children}</main>
      <SiteFooter />
      <FloatingWhatsAppButton />
    </>
  );
}
