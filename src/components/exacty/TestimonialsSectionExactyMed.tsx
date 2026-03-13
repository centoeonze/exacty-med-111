import { motion } from "framer-motion";
import { Star } from "lucide-react";
import SectionContainer from "./SectionContainer";
import SectionHeader from "./SectionHeader";

const TESTIMONIALS = [
  {
    name: "Dra. Camila R.",
    role: "Dermatologista",
    text: "A entrega é extremamente rápida e o suporte consultivo faz toda a diferença na rotina da clínica.",
    stars: 5,
  },
  {
    name: "Dr. Rafael M.",
    role: "Médico Esteta",
    text: "Procedência garantida e nota fiscal em todos os pedidos. Trabalhar com a Exacty Med me dá tranquilidade.",
    stars: 5,
  },
  {
    name: "Dra. Juliana T.",
    role: "Biomédica Esteta",
    text: "Estoque sempre disponível e atendimento personalizado. Nunca precisei cancelar agenda por falta de produto.",
    stars: 5,
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const TestimonialsSectionExactyMed = () => (
  <SectionContainer id="depoimentos">
    <SectionHeader title="O que profissionais dizem sobre a Exacty Med" />

    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      {TESTIMONIALS.map((t) => (
        <motion.div key={t.name} variants={item} className="glass-card p-6 flex flex-col gap-4">
          <div className="flex gap-0.5">
            {Array.from({ length: t.stars }).map((_, i) => (
              <Star key={i} size={14} className="fill-primary text-primary" />
            ))}
          </div>
          <p className="text-foreground text-sm leading-relaxed italic">"{t.text}"</p>
          <div className="mt-auto pt-3 border-t border-border/50">
            <p className="font-display font-semibold text-foreground text-sm">{t.name}</p>
            <p className="text-muted-foreground text-xs">{t.role}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  </SectionContainer>
);

export default TestimonialsSectionExactyMed;
