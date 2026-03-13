import { motion } from "framer-motion";
import { ShieldCheck, Truck, Users, PackageCheck } from "lucide-react";
import SectionContainer from "./SectionContainer";
import SectionHeader from "./SectionHeader";

const HIGHLIGHTS = [
  { icon: PackageCheck, label: "Estoque disponível" },
  { icon: Truck, label: "Entrega rápida na região" },
  { icon: Users, label: "Atendimento consultivo" },
  { icon: ShieldCheck, label: "Rastreabilidade total" },
];

const AuthoritySectionExactyMed = () => (
  <SectionContainer id="sobre" className="relative overflow-hidden">
    {/* bg accent */}
    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-purple-glow/5 blur-[140px] pointer-events-none" />

    <SectionHeader
      title="Distribuição especializada para quem não pode correr riscos"
      subtitle="Procedência, armazenamento e prazo — tudo sob controle para a sua clínica."
    />

    <div className="grid md:grid-cols-2 gap-8 items-center">
      {/* Text block */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-muted-foreground leading-relaxed text-base mb-8">
          Distribuidora especializada em profissionais da estética avançada, com operação orientada por disponibilidade, conservação adequada e atendimento consultivo.
          Atuamos em Londrina, Cambé, Ibiporã e região com entrega rápida e segura.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {HIGHLIGHTS.map((h) => (
            <div key={h.label} className="glass-card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <h.icon size={18} className="text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{h.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Visual placeholder */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative"
      >
        <div className="glass-card aspect-[4/3] flex items-center justify-center rounded-2xl overflow-hidden">
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <ShieldCheck size={32} className="text-primary" />
            </div>
            <p className="font-display text-lg font-semibold text-foreground">Operação Profissional</p>
            <p className="text-sm text-muted-foreground mt-2">Estoque, logística e atendimento especializados</p>
          </div>
        </div>
      </motion.div>
    </div>
  </SectionContainer>
);

export default AuthoritySectionExactyMed;
