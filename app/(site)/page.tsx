import { HeroSection } from "@/features/institutional/components/HeroSection";
import { CompromissoAmbientalSection } from "@/features/institutional/components/CompromissoAmbientalSection";
import { ImpactCountersSection } from "@/features/institutional/components/ImpactCountersSection";
import { ServicosSection } from "@/features/institutional/components/ServicosSection";
import { ComoFuncionaSection } from "@/features/institutional/components/ComoFuncionaSection";
import { TransparenciaLicensesSection } from "@/features/institutional/components/TransparenciaLicensesSection";
import { ReviewsSection } from "@/features/institutional/components/ReviewsSection";
import { PortalClienteCTA } from "@/features/institutional/components/PortalClienteCTA";
import { ContactSection } from "@/features/institutional/components/ContactSection";
import { SectionDivider } from "@/components/ui/SectionDivider";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SectionDivider index={0} />
      <CompromissoAmbientalSection />
      <SectionDivider index={1} />
      <ImpactCountersSection />
      <SectionDivider index={2} />
      <ServicosSection />
      <SectionDivider index={3} />
      <ComoFuncionaSection />
      <SectionDivider index={4} />
      <TransparenciaLicensesSection />
      <SectionDivider index={5} />
      <ReviewsSection />
      <SectionDivider index={6} />
      <PortalClienteCTA />
      <SectionDivider index={7} />
      <ContactSection />
    </>
  );
}
