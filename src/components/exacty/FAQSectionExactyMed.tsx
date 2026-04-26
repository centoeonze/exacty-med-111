import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type FaqItem = {
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Quem pode comprar os produtos da Exacty Med?",
    answer:
      "A Exacty Med realiza venda exclusiva para profissionais habilitados, clínicas e empresas do setor de saúde e estética avançada, conforme exigências regulatórias aplicáveis.",
  },
  {
    question: "Os produtos possuem procedência?",
    answer:
      "Sim. Trabalhamos com produtos de procedência controlada, marcas reconhecidas e processos de rastreabilidade para garantir mais segurança desde o estoque até a entrega.",
  },
  {
    question: "A Exacty Med possui certificação ANVISA?",
    answer:
      "Sim. A Exacty Med atua com regularidade e documentos regulatórios aplicáveis à sua operação, oferecendo mais segurança para clínicas e profissionais habilitados.",
  },
  {
    question: "Como funciona a entrega?",
    answer:
      "A Exacty Med possui logística adequada para produtos de saúde e medicamentos, com envio para todo o Brasil e entrega ágil em regiões atendidas pela operação local.",
  },
  {
    question: "É possível solicitar catálogo?",
    answer:
      "Sim. O catálogo pode ser solicitado diretamente pela página através dos botões de contato. Nossa equipe orienta sobre disponibilidade, marcas e condições comerciais.",
  },
  {
    question: "Os produtos têm rastreabilidade?",
    answer:
      "Sim. A Exacty Med trabalha com rastreabilidade do início ao fim, incluindo controle de estoque, procedência e informações relevantes para a segurança da operação.",
  },
  {
    question: "A Exacty Med atende apenas clínicas?",
    answer:
      "A Exacty Med atende profissionais habilitados, clínicas e empresas do setor de saúde e estética avançada que estejam aptos à aquisição dos produtos.",
  },
  {
    question: "Como falar com um consultor?",
    answer:
      "Você pode clicar nos botões de contato disponíveis na página para falar com a equipe comercial da Exacty Med e receber atendimento personalizado.",
  },
];

const easeOut = [0.22, 1, 0.36, 1] as const;

const FAQSectionExactyMed = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="exacty-section-blend relative overflow-hidden bg-transparent py-24 md:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,5,13,0.72)_0%,rgba(11,7,18,0.44)_40%,rgba(7,5,13,0.72)_100%)]" />
        <div className="absolute left-1/2 top-16 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[108px]" />
        <div className="absolute left-1/2 top-1/3 h-[480px] w-[760px] -translate-x-1/2 rounded-full bg-purple-500/10 blur-[148px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.14),transparent_34%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:18px_18px] opacity-[0.03]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.72, ease: easeOut }}
          className="mx-auto mb-12 max-w-5xl text-center md:mb-16"
        >
          <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.28em] text-violet-200/70">
            INFORMAÇÕES IMPORTANTES
          </p>
          <h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-50 sm:text-5xl md:text-6xl">
            Dúvidas frequentes
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
            Veja as principais informações sobre compra, entrega, procedência e atendimento da Exacty Med.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: easeOut }}
          className="mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_30px_100px_rgba(0,0,0,0.35)]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_26%,rgba(0,0,0,0.34)_100%)] opacity-70" />
          <div className="relative z-10 px-6 py-2 md:px-8">
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item) => (
                <AccordionItem key={item.question} value={item.question} className="border-white/10">
                  <AccordionTrigger className="text-left text-[15px] font-semibold text-zinc-100 no-underline hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-[14px] leading-7 text-zinc-400">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </div>
    </section>
  );
};

export default FAQSectionExactyMed;

