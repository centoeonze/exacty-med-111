import acido from "@/assets/optimized/acido-hialuronico.webp";
import dermaPen from "@/assets/optimized/derma-pen.webp";
import dermaRoller from "@/assets/optimized/dermaroller1.webp";
import soro from "@/assets/optimized/soro.webp";
import toxina from "@/assets/optimized/toxina-botulinica.webp";
import skinVibra from "@/assets/skinvibra.webp";

const ensureProfessionals = (roles: string[]) => {
  const required = ["Farmacêutico", "Fisioterapeuta"];
  const set = new Set(roles);
  for (const r of required) set.add(r);
  return Array.from(set);
};

const createNeutralMockupDataUri = (title: string) => {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="620" height="980" viewBox="0 0 620 980">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#151024"/>
      <stop offset="0.45" stop-color="#0e0a18"/>
      <stop offset="1" stop-color="#07050d"/>
    </linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="rgba(255,255,255,0.22)"/>
      <stop offset="0.45" stop-color="rgba(169,124,255,0.12)"/>
      <stop offset="1" stop-color="rgba(255,255,255,0.10)"/>
    </linearGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="18" result="blur"/>
      <feColorMatrix in="blur" type="matrix"
        values="1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 0.55 0" result="soft"/>
      <feMerge>
        <feMergeNode in="soft"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect x="56" y="70" width="508" height="840" rx="44" fill="url(#bg)" stroke="url(#edge)" stroke-width="2"/>
  <rect x="78" y="94" width="464" height="64" rx="22" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
  <text x="310" y="136" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto" font-size="18" font-weight="700" fill="rgba(255,255,255,0.86)" letter-spacing="1.6">
    MOCKUP NEUTRO
  </text>

  <circle cx="310" cy="450" r="180" fill="rgba(139,92,246,0.12)" filter="url(#glow)"/>
  <rect x="120" y="278" width="380" height="360" rx="34" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)" stroke-width="1.5"/>
  <text x="310" y="408" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto" font-size="26" font-weight="700" fill="rgba(255,255,255,0.92)">
    ${title}
  </text>
  <text x="310" y="446" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto" font-size="16" font-weight="500" fill="rgba(207,200,218,0.78)">
    Sem imagem real (conforme RDC)
  </text>
</svg>
`.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const createPlaceholderCardImageDataUri = (title: string) => {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="620" height="980" viewBox="0 0 620 980">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1a1130"/>
      <stop offset="0.55" stop-color="#0f0a1d"/>
      <stop offset="1" stop-color="#07050d"/>
    </linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="rgba(255,255,255,0.20)"/>
      <stop offset="0.5" stop-color="rgba(169,124,255,0.14)"/>
      <stop offset="1" stop-color="rgba(255,255,255,0.10)"/>
    </linearGradient>
  </defs>

  <rect x="56" y="70" width="508" height="840" rx="44" fill="url(#bg)" stroke="url(#edge)" stroke-width="2"/>
  <circle cx="310" cy="420" r="210" fill="rgba(139,92,246,0.10)"/>
  <rect x="120" y="260" width="380" height="420" rx="36" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)" stroke-width="1.5"/>

  <text x="310" y="430" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto" font-size="26" font-weight="700" fill="rgba(255,255,255,0.92)">
    ${title}
  </text>
  <text x="310" y="470" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto" font-size="15" font-weight="500" fill="rgba(207,200,218,0.78)">
    Placeholder neutro (substituível)
  </text>

  <rect x="156" y="742" width="308" height="56" rx="999" fill="rgba(139,92,246,0.14)" stroke="rgba(139,92,246,0.22)"/>
  <text x="310" y="779" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto" font-size="14" font-weight="700" fill="rgba(233,222,253,0.9)" letter-spacing="1.2">
    EXACTY MED
  </text>
</svg>
`.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export type ProductSpec = {
  label: string;
  value: string;
};

type PortfolioImage = {
  src: string;
  width: number;
  height: number;
};

export type PortfolioItem = {
  title: string;
  image: PortfolioImage;
  description: string;
  canApply: string[];
  canBuy: string[];
  specs: ProductSpec[];
};

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    title: "Toxinas",
    image: { src: toxina, width: 1100, height: 1272 },
    description:
      "Categoria disponível para profissionais habilitados.",
    canApply: ensureProfessionals(["Biomédicos", "Dentistas", "Médicos"]),
    canBuy: ["Clínicas", "Profissionais habilitados", "Pessoa jurídica da área"],
    specs: [
      { label: "Itens", value: "Categoria com imagem restrita (conforme RDC)." },
      { label: "Marcas", value: "Nabota; Botulim; Botox; Botulift." },
      { label: "Categoria", value: "toxinas" },
    ],
  },
  {
    title: "Medicamentos",
    image: { src: soro, width: 720, height: 1280 },
    description: "Soro, água para injeção, bicarbonato e anestésicos.",
    canApply: ensureProfessionals(["Biomédicos", "Dentistas", "Enfermeiros", "Médicos"]),
    canBuy: ["Clínicas", "Consultórios", "Profissionais habilitados", "Pessoa jurídica da área"],
    specs: [
      { label: "Produtos", value: "Soro; Água p/ injeção; Bicarbonato de Sódio; Anestésico Xylestesin." },
      { label: "Categoria", value: "medicamentos soro agua para injecao bicarbonato de sodio anestesico xylestesin" },
    ],
  },
  {
    title: "Preenchedores",
    image: { src: acido, width: 1100, height: 1135 },
    description: "Preenchedores para estética avançada.",
    canApply: ensureProfessionals(["Biomédicos", "Dentistas", "Médicos"]),
    canBuy: ["Clínicas", "Profissionais habilitados", "Pessoa jurídica da área"],
    specs: [
      { label: "Marcas", value: "Rennova; Saypha; Finahfil; E.P.T.Q.; Biogelis." },
      { label: "Categoria", value: "preenchedores acido hialuronico rennova saypha finahfil e.p.t.q. biogelis" },
    ],
  },
  {
    title: "Skinboosters",
    image: { src: "/regulatorio/Skinbooster copiar 3.png", width: 994, height: 375 },
    description: "Restylane Vital e Saypha Rich.",
    canApply: ensureProfessionals(["Biomédicos", "Dentistas", "Médicos"]),
    canBuy: ["Clínicas", "Profissionais habilitados", "Pessoa jurídica da área"],
    specs: [
      { label: "Marcas", value: "Restylane Vital; Saypha Rich." },
      { label: "Categoria", value: "skinboosters restylane vital saypha rich" },
    ],
  },
  {
    title: "Bioestimulador de Colágeno",
    image: { src: "/regulatorio/bioestimulador-copiar.png", width: 382, height: 694 },
    description: "Bioestimuladores de colágeno para profissionais habilitados.",
    canApply: ensureProfessionals(["Biomédicos", "Dentistas", "Médicos"]),
    canBuy: ["Clínicas", "Profissionais habilitados", "Pessoa jurídica da área"],
    specs: [
      { label: "Categoria", value: "bioestimuladores bioestimulador de colageno" },
    ],
  },
  {
    title: "Equipamentos",
    image: { src: dermaPen, width: 1100, height: 1100 },
    description:
      "Derma Pen, Skinvibra, cartuchos e Derma Roller.",
    canApply: ensureProfessionals(["Biomédicos", "Dentistas", "Esteticistas", "Médicos"]),
    canBuy: ["Clínicas", "Consultórios", "Pessoa jurídica da área"],
    specs: [
      { label: "Produtos", value: "Derma Pen; Skinvibra; Cartuchos; Derma Roller." },
      { label: "Categoria", value: "equipamentos derma pen skinvibra cartuchos derma roller" },
    ],
  },
  {
    title: "Dermocosméticos",
    image: { src: "/regulatorio/dermocosmeticologo.png", width: 405, height: 487 },
    description: "Máscaras, hidratantes e séruns especializados.",
    canApply: ensureProfessionals(["Biomédicos", "Dentistas", "Médicos", "Esteticistas habilitados"]),
    canBuy: ["Clínicas", "Profissionais habilitados", "Pessoa jurídica da área"],
    specs: [
      {
        label: "Produtos",
        value:
          "MÁSCARA HYALURONIC ACID (5un); HIDRATANTE ALURÁH10 - 50ml; SÉRUM SKINDEEP BOTULINUM - 10ml; SÉRUM SKINDEEP EGF - 10ml; SÉRUM SKINDEEP EYE ELASTICITY - 10ml; SÉRUM SKINDEEP TRANEXAMIC ACID - 10ml; SÉRUM SKINDEEP PDRN NEOHAIR - 10ml; SÉRUM SKINDEEP PDRN NEOBIO - 10ml.",
      },
      { label: "Categoria", value: "dermocosmeticos mascara hidratante serum skindeep botulinum egf eye elasticity tranexamic acid pdrn neo hair neobio" },
    ],
  },
  {
    title: "Descartáveis",
    image: { src: "/regulatorio/descardlogo.png", width: 700, height: 416 },
    description: "Itens descartáveis para rotina clínica.",
    canApply: ensureProfessionals(["Biomédicos", "Dentistas", "Médicos", "Esteticistas habilitados"]),
    canBuy: ["Clínicas", "Profissionais habilitados", "Pessoa jurídica da área"],
    specs: [
      {
        label: "Produtos",
        value:
          "Algodão hidrófilo Nathy 500 g\nMáscara tripla branca/preta Medix, caixa com 50 unidades\nPropé branco 20 g, pacote com 100 unidades\nTouca branca descartável, pacote com 100 unidades\nLençol com elástico em TNT, 2,00 m x 0,90 m, pacote com 10 unidades\nTorneira 3 vias Luer Lock Descarpack\nIndicador biológico a vapor 24 h 2i, caixa com 10 unidades\nIndicador químico a vapor tipo I6 D Tech, caixa com 250 unidades\nBabador impermeável branco SSPlus, pacote com 100 unidades\nBabador impermeável branco ou colorido Biodinâmica, pacote com 100 unidades\nFita microporosa 12,5 mm x 10 m bege 3M\nFita microporosa 25 mm x 10 m bege 3M\nCurativo pós-coleta de sangue bege Blood Stop, caixa com 500 unidades",
      },
      { label: "Categoria", value: "descartaveis algodao mascara prope touca lencol torneira 3 vias luer lock indicador biologico indicador quimico babador fita microporosa curativo blood stop" },
    ],
  },
  {
    title: "Saneantes",
    image: { src: "/regulatorio/saneantes.png", width: 203, height: 360 },
    description: "Smart Clorex e Álcool 70º.",
    canApply: ensureProfessionals(["Biomédicos", "Dentistas", "Enfermeiros", "Médicos"]),
    canBuy: ["Clínicas", "Consultórios", "Pessoa jurídica da área"],
    specs: [
      { label: "Marcas", value: "Smart Clorex; Álcool 70º." },
      { label: "Categoria", value: "saneantes smart clorex alcool 70" },
    ],
  },
];

export const AUTOPLAY_DELAY = 10000;
