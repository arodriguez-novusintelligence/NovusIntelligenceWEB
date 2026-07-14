export interface CaseStudy {
  id: string;
  client: string;
  country: string;
  industry: string;
  challenge: string;
  solution: string;
  impact: string[];
}

export const cases: CaseStudy[] = [
  {
    id: "banco-santa-cruz",
    client: "Banco Santa Cruz",
    country: "República Dominicana",
    industry: "Banca",
    challenge:
      "Optimizar procesos operativos críticos y habilitar experiencias inteligentes para clientes corporativos.",
    solution:
      "Implementación de agentes inteligentes, automatización de back-office y analítica avanzada sobre infraestructura cloud segura.",
    impact: [
      "Procesos operativos más rápidos y trazables",
      "Mayor capacidad de respuesta al cliente",
      "Decisiones soportadas por datos en tiempo real",
    ],
  },
  {
    id: "doevents",
    client: "doevents.com",
    country: "Internacional",
    industry: "Tecnología / Eventos",
    challenge:
      "Escalar la plataforma con inteligencia que personalice la experiencia y automatice operación.",
    solution:
      "Integración de capacidades de IA en el producto, automatización de procesos clave y arquitectura cloud escalable.",
    impact: [
      "Experiencia personalizada para asistentes",
      "Operación más eficiente",
      "Producto preparado para crecer sin fricción",
    ],
  },
];

export const partners = [
  { name: "AWS", primary: true },
  { name: "Microsoft Azure", primary: false },
  { name: "Google Cloud", primary: false },
] as const;
