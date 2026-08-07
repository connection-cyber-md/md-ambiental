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
      "https://www.google.com/maps/place/MD+Ambiental+Coleta+de+%C3%93leo+Lubrificante+Usado/@-22.7570671,-47.6459738,17z",
    // Street View da fachada, aberto pelo ícone de localização ao lado do
    // endereço no rodapé — diferente de mapsUrl (que aponta pra página do
    // local, usada no link de avaliações).
    streetViewUrl:
      "https://www.google.com/maps/@-22.7571646,-47.6461647,3a,75y,54.77h,90t/data=!3m7!1e1!3m5!1sX_d9cqVzYDIsOvDLJcFlOw!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail",
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
