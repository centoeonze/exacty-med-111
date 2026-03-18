import acido from "@/assets/optimized/acido-hialuronico.webp";
import bioestimulador from "@/assets/optimized/bioestimuladores-de-colageno.webp";
import dermaPen from "@/assets/optimized/derma-pen.webp";
import dermaRoller from "@/assets/optimized/dermaroller1.webp";
import fiosDePdo from "@/assets/optimized/fiosdepdo1.webp";
import skinVibra from "@/assets/skinvibra.webp";
import soro from "@/assets/optimized/soro.webp";
import toxina from "@/assets/optimized/toxina-botulinica.webp";

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
    title: "Toxina Botulínica",
    image: { src: toxina, width: 1100, height: 1272 },
    description:
      "Soluções para harmonização facial com procedência, rastreabilidade e suporte consultivo para rotinas clínicas que exigem conservação rigorosa.",
    canApply: ["Biomédicos", "Dentistas", "Médicos"],
    canBuy: ["Clínicas", "Profissionais habilitados", "Pessoa jurídica da área"],
    specs: [
      { label: "Marcas", value: "Nabota, Botulim, Botox, Botulift" },
      { label: "Armazenamento", value: "Controle rigoroso de temperatura" },
      { label: "Disponibilidade", value: "Consulte estoque e lote" },
      { label: "Categoria", value: "Injetáveis para estética avançada" },
    ],
  },
  {
    title: "Preenchedores de Ácido Hialurônico",
    image: { src: acido, width: 1100, height: 1135 },
    description:
      "Linhas para volumização, contorno e refinamento facial com procedência homologada e apoio comercial para escolha da melhor apresentação.",
    canApply: ["Biomédicos", "Dentistas", "Médicos"],
    canBuy: ["Clínicas", "Profissionais habilitados", "Pessoa jurídica da área"],
    specs: [
      { label: "Marcas", value: "Rennova, Saypha, Finahfil, E.P.T.Q., Biogelis" },
      { label: "Apresentação", value: "Protocolos para volumização e refinamento" },
      { label: "Conservação", value: "Transporte e armazenamento monitorados" },
      { label: "Disponibilidade", value: "Consulte lote, validade e estoque" },
    ],
  },
  {
    title: "Bioestimuladores de Colágeno",
    image: { src: bioestimulador, width: 1100, height: 1971 },
    description:
      "Portfólio voltado para protocolos de firmeza e estímulo dérmico, com rastreabilidade completa e suporte consultivo para planejamento clínico.",
    canApply: ["Biomédicos", "Dentistas", "Médicos"],
    canBuy: ["Clínicas", "Profissionais habilitados", "Pessoa jurídica da área"],
    specs: [
      { label: "Marcas", value: "Elleva, Diamond, Nutriex" },
      { label: "Faixa de uso", value: "Protocolos faciais e corporais conforme indicação" },
      { label: "Armazenamento", value: "Condições controladas de conservação" },
      { label: "Disponibilidade", value: "Estoque consultivo sob demanda" },
    ],
  },
  {
    title: "Fios de PDO",
    image: { src: fiosDePdo, width: 415, height: 602 },
    description:
      "Fios para sustentação e estímulo tecidual com atendimento consultivo para protocolos avançados e disponibilidade alinhada à agenda da clínica.",
    canApply: ["Biomédicos", "Dentistas", "Médicos"],
    canBuy: ["Clínicas", "Profissionais habilitados", "Pessoa jurídica da área"],
    specs: [
      { label: "Marcas", value: "i-Thread, Prodeep" },
      { label: "Apresentação", value: "Configurações variadas para diferentes protocolos" },
      { label: "Categoria", value: "Sustentação e bioestimulação tecidual" },
      { label: "Disponibilidade", value: "Consulte medidas e estoque atual" },
    ],
  },
  {
    title: "Soro Fisiológico",
    image: { src: soro, width: 720, height: 1280 },
    description:
      "Soro fisiológico para apoio a procedimentos estéticos e clínicos, com disponibilidade alinhada à rotina da clínica e atendimento consultivo para reposição ágil.",
    canApply: ["Biomédicos", "Dentistas", "Enfermeiros", "Médicos"],
    canBuy: ["Clínicas", "Consultórios", "Pessoa jurídica da área"],
    specs: [
      { label: "Aplicação", value: "Apoio a procedimentos clínicos e estéticos" },
      { label: "Disponibilidade", value: "Reposição recorrente conforme demanda" },
      { label: "Armazenamento", value: "Organização e logística para uso imediato" },
      { label: "Categoria", value: "Soro fisiológico para rotina profissional" },
    ],
  },
  {
    title: "Equipamentos Estéticos",
    image: { src: dermaRoller, width: 500, height: 500 },
    description:
      "Equipamentos e acessórios para complementar protocolos com atendimento consultivo, orientação comercial e curadoria alinhada ao perfil da clínica.",
    canApply: ["Biomédicos", "Dentistas", "Esteticistas", "Médicos"],
    canBuy: ["Clínicas", "Consultórios", "Pessoa jurídica da área"],
    specs: [
      { label: "Linhas", value: "Derma Pen, Derma Roller, Skin Vibra" },
      { label: "Categoria", value: "Equipamentos e acessórios para estética avançada" },
      { label: "Disponibilidade", value: "Consulte modelos e pronta-entrega" },
      { label: "Suporte", value: "Atendimento consultivo para seleção do portfólio" },
    ],
  },
  {
    title: "Derma Pen",
    image: { src: dermaPen, width: 1100, height: 1100 },
    description:
      "Equipamento estético para procedimentos minimamente invasivos com aplicação precisa e suporte consultivo especializado.",
    canApply: ["Biomédicos", "Dentistas", "Médicos", "Esteticistas habilitados"],
    canBuy: ["Clínicas", "Profissionais habilitados", "Pessoa jurídica da área"],
    specs: [
      { label: "Categoria", value: "Equipamentos estéticos" },
      { label: "Aplicação", value: "Procedimentos faciais e protocolos estéticos" },
      { label: "Disponibilidade", value: "Consulte estoque e versões disponíveis" },
      { label: "Suporte", value: "Atendimento consultivo para escolha do equipamento" },
    ],
  },
  {
    title: "SkinVibra",
    image: { src: skinVibra, width: 1000, height: 1000 },
    description:
      "Equipamento estético para protocolos faciais com suporte consultivo, curadoria comercial e disponibilidade alinhada à rotina da clínica.",
    canApply: ["Biomédicos", "Dentistas", "Médicos", "Esteticistas habilitados"],
    canBuy: ["Clínicas", "Profissionais habilitados", "Pessoa jurídica da área"],
    specs: [
      { label: "Categoria", value: "Equipamentos estéticos" },
      { label: "Aplicação", value: "Protocolos faciais e complementação de rotinas estéticas" },
      { label: "Disponibilidade", value: "Consulte estoque e pronta-entrega" },
      { label: "Suporte", value: "Atendimento consultivo para seleção do equipamento" },
    ],
  },
];

export const AUTOPLAY_DELAY = 10000;
