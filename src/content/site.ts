export const site = {
  name: "Novus Intelligence Solutions",
  shortName: "Novus",
  taglineEn: "Building Autonomous Intelligence",
  taglineEs: "Transformamos empresas con inteligencia que genera resultados",
  domain: "novusintelligencesolutions.com",
  url: "https://novusintelligencesolutions.com",
  email: "arodriguez@novusintelligencesolutions.com",
  phone: "+57 302 757 6511",
  phoneHref: "tel:+573027576511",
  city: "Bogotá, Colombia",
  founder: {
    name: "Andrés D. Rodríguez Vargas",
    role: "Founder & CEO",
  },
  social: {
    linkedin: "https://www.linkedin.com/company/novus-intelligence-solutions",
    instagram: "https://www.instagram.com/novusintelligencesolutions",
    facebook: "https://www.facebook.com/novusintelligencesolutions",
  },
} as const;

export const nav = {
  main: [
    { label: "Inicio", to: "/" },
    { label: "Servicios", to: "/services" },
    { label: "Soluciones", to: "/solutions" },
    { label: "Nosotros", to: "/about" },
    { label: "Casos", to: "/cases" },
    { label: "Contacto", to: "/contact" },
  ],
  legal: [
    { label: "Privacidad", to: "/privacy" },
    { label: "Tratamiento de datos", to: "/data-treatment" },
    { label: "Términos", to: "/terms" },
  ],
} as const;

export const meta = {
  defaultTitle: "Novus Intelligence Solutions — Building Autonomous Intelligence",
  defaultDescription:
    "Diseñamos, implementamos y operamos soluciones de Inteligencia Artificial, sistemas multiagente y automatización inteligente para empresas en evolución.",
  ogImage: "/assets/novus/brand-publicidad.svg",
} as const;

export const impactStats = [
  { value: "3+", label: "Cloud partners" },
  { value: "6", label: "Soluciones IA" },
  { value: "24/7", label: "Agentes autónomos" },
  { value: "Bogotá", label: "HQ Colombia" },
] as const;

export const heroStats = [
  { value: "AWS", label: "Partner principal" },
  { value: "Multiagente", label: "Core focus" },
  { value: "Bogotá", label: "Sede regional" },
] as const;
