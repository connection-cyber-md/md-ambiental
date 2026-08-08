export const siteConfig = {
  name: "MD Ambiental",
  legalName: "MD Ambiental — Coleta de Óleo Lubrificante Usado",
  companyName: "MD Ambiental Ltda",
  cnpj: "57.206.034/0001-54",
  whatsapp: {
    number: "5511965258055",
    displayNumber: "(11) 9 6525-8055",
  },
  email: "coleta@mdambiental.com",
  address: {
    line: "Av. São Paulo, 2115 — Paulicéia, Piracicaba - SP, 13401-541",
    ibgeCode: "3538709",
    uf: "SP",
    mapsUrl:
      "https://www.google.com/maps/place//@-22.7570671,-47.6459738,17z?entry=ttu&g_ep=EgoyMDI2MDgwNS4xIKXMDSoASAFQAw%3D%3D",
    // Street View da fachada, aberto pelo ícone de localização ao lado do
    // endereço no rodapé — diferente de mapsUrl (que aponta pra página do
    // local, usada no link de avaliações).
    streetViewUrl:
      "https://www.google.com/maps/place/Av.+S%C3%A3o+Paulo,+2115+-+Centro+(Tupi),+Piracicaba+-+SP,+13401-541/@-22.7570621,-47.6485487,17z/data=!3m1!4b1!4m6!3m5!1s0x94c6308aaddcc3cb:0x2523423a82508a87!8m2!3d-22.7570671!4d-47.6459738!16s%2Fg%2F11nxbn64c2?entry=ttu&g_ep=EgoyMDI2MDgwNS4xIKXMDSoASAFQAw%3D%3D",
  },
  socialProof: {
    rating: "5,0",
    reviewCount: 38,
  },
  // TODO: substituir pelos perfis reais assim que forem informados.
  social: {
    instagram: "#",
    facebook: "#",
    linkedin: "#",
  },
  // TODO: preencher quando o nome (e link, se houver) da empresa/desenvolvedora
  // responsável pelo site for informado. Enquanto for null, o rodapé não
  // exibe a linha de crédito — ver SiteFooter.tsx.
  developer: {
    name: "Connection Cyber Assessoria e Treinamento Tecnológico" as string | null,
    url: null as string | null,
  },
} as const;

export function buildWhatsAppLink(message: string) {
  return `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(message)}`;
}
