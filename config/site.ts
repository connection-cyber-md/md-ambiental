export const siteConfig = {
  name: "MD Ambiental",
  legalName: "MD Ambiental — Coleta de Óleo Lubrificante Usado",
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
  },
  socialProof: {
    rating: "5,0",
    reviewCount: 38,
  },
} as const;

export function buildWhatsAppLink(message: string) {
  return `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(message)}`;
}
