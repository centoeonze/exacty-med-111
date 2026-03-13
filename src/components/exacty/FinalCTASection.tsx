import { motion } from "framer-motion";
import { getWhatsAppUrl } from "./WhatsAppLink";

const FinalCTASection = () => (
  <section className="relative py-20 md:py-32 overflow-hidden">
    {/* Bg */}
    <div className="absolute inset-0" style={{ background: "var(--gradient-purple)" }} />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsla(0,0%,100%,0.08),transparent_60%)]" />

    <div className="container mx-auto max-w-3xl px-5 md:px-8 relative z-10 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground leading-tight"
      >
        Quando você aplica um injetável, o resultado depende não apenas da técnica, mas da procedência, conservação e confiabilidade do produto.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mt-6 text-primary-foreground/80 text-base md:text-lg leading-relaxed"
      >
        Com a Exacty Med, você trabalha com estoque disponível, NF e lote rastreável — sem comprometer sua agenda.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-10"
      >
        <a
          href={getWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-full bg-primary-foreground text-primary font-semibold px-8 py-4 text-base transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          Falar com um consultor agora
        </a>
      </motion.div>
    </div>
  </section>
);

export default FinalCTASection;
