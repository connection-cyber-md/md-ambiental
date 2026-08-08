import { HeroSection } from "@/features/institutional/components/HeroSection";
import { CompromissoAmbientalSection } from "@/features/institutional/components/CompromissoAmbientalSection";
import { SocialProofServicosSection } from "@/features/institutional/components/SocialProofServicosSection";
import { ComoFuncionaSection } from "@/features/institutional/components/ComoFuncionaSection";
import { ImpactTransparencySection } from "@/features/institutional/components/ImpactTransparencySection";
import { SectionDivider } from "@/components/ui/SectionDivider";

// SocialProofServicosSection une Prova Social + Nossos Serviços e ocupa a
// posição que a antiga ServicosSection (full-width) tinha na página.
// ImpactTransparencySection une Impacto socioambiental + Transparência, com
// Área do cliente empilhada abaixo de Impacto. Por pedido explícito.
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SectionDivider index={0} />
      <CompromissoAmbientalSection />
      <SectionDivider index={1} />
      <SocialProofServicosSection />
      <SectionDivider index={2} />
      <ComoFuncionaSection />
      <SectionDivider index={3} />
      <ImpactTransparencySection />
    </>
  );
}