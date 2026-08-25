import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SocialRail } from "@/components/layout/SocialRail";
import { FloatingWhatsAppButton } from "@/components/layout/FloatingWhatsAppButton";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <SiteHeader />
      <SocialRail />
      <main>{children}</main>
      <SiteFooter />
      <FloatingWhatsAppButton />
    </SmoothScrollProvider>
  );
}