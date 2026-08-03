import { HeroSection } from "@/features/institutional/components/HeroSection";
import { CompromissoAmbientalSection } from "@/features/institutional/components/CompromissoAmbientalSection";
import { ServicosSection } from "@/features/institutional/components/ServicosSection";
import { ComoFuncionaSection } from "@/features/institutional/components/ComoFuncionaSection";
import { TransparenciaLicensesSection } from "@/features/institutional/components/TransparenciaLicensesSection";
import { ReviewsSection } from "@/features/institutional/components/ReviewsSection";
import { PortalClienteCTA } from "@/features/institutional/components/PortalClienteCTA";
import { ContactSection } from "@/features/institutional/components/ContactSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CompromissoAmbientalSection />
      <ServicosSection />
      <ComoFuncionaSection />
      <TransparenciaLicensesSection />
      <ReviewsSection />
      <PortalClienteCTA />
      <ContactSection />
    </>
  );
}
