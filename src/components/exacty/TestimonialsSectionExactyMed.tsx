import * as React from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

type Testimonial = {
  name: string;
  quote: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Jeissica Penasso",
    quote: "Fui muito bem atendida, os produtos chegaram rápido e veio tudo certinho, super recomendo!",
  },
  {
    name: "Camila Carvalho",
    quote: "Atendimento perfeito, chegou tudo certinho dentro do prazo e em ótimo estado ♥️",
  },
  {
    name: "Adriely Saita",
    quote: "Fui muito bem atendida pela consultora Solange, os produtos são de ótima qualidade e a entrega é rápida.",
  },
  {
    name: "Lidiane Lima Cury",
    quote: "Atendimento sempre impecável. Entrega rápida e produtos sempre de qualidade. Recomendo muito.",
  },
  {
    name: "Giovana Henrique",
    quote:
      "Atendimento excelente! Fui super bem atendida, com muita atenção e agilidade. A entrega foi super rápida e os produtos vieram impecáveis — tudo de muita qualidade, especialmente os materiais descartáveis. Com certeza voltarei a comprar.",
  },
  {
    name: "Júlia Zafalon",
    quote:
      "Melhor distribuidora, produtos excelentes com valores ótimos, além da entrega ser super rápida! Recomendo de olhos fechados, atendimento impecável!",
  },
  {
    name: "Regina De Nobili",
    quote: "Muito satisfeita pela agilidade para receber o produto.",
  },
  {
    name: "Aliny Do Carmo Pletz",
    quote: "Já sou cliente há 3 anos e indico a empresa por agilidade nos atendimentos e nas entregas.",
  },
  {
    name: "Emilly Hortencio",
    quote:
      "Quero deixar meu elogio para a Solange, que faz um trabalho simplesmente impecável! 💫 Desde o atendimento até a qualidade dos produtos, tudo é feito com muito carinho.",
  },
  {
    name: "Isis Kovesdy Bravo",
    quote:
      "Ótimo atendimento! Super simpáticos e ágeis! Chega no mesmo dia o pedido e eles têm uma ampla variedade de produtos!",
  },
  {
    name: "Mayla Maziero",
    quote:
      "Sempre sou bem atendida! Entrega rápida e produtos de qualidade. Recomendo demais! Parabéns ao pessoal do atendimento, que são sempre atenciosos e prestativos.",
  },
  {
    name: "Camille Castilho",
    quote: "Ótimos preços, ótima variedade de produtos e rápidos na entrega! Solange, uma ótima atendente.",
  },
  {
    name: "Vanessa Bernardes",
    quote:
      "Atendimento excelente, atenção, produtos de qualidade e chegou tudo certinho. Obrigada em especial à Giovana, que me atendeu com carinho e paciência.",
  },
  {
    name: "Taís Barboza",
    quote:
      "A equipe da Exactly foi impecável no atendimento — prestativos, ágeis e muito cordiais. Ficamos felizes em ter parceiros locais comprometidos com a qualidade e o bom atendimento. Recomendo! 👏",
  },
  {
    name: "Alline Passos",
    quote:
      "Sou cliente há algum tempo e sempre tenho uma experiência excelente. A toxina botulínica é de ótima qualidade, os produtos chegam bem embalados e dentro do prazo. O atendimento também merece destaque: equipe atenciosa, prestativa e pronta para ajudar.",
  },
  {
    name: "Janaina Melo",
    quote:
      "Estou muito feliz com o atendimento dessa loja, as meninas muito atenciosas para explicar e realizar os pedidos, entrega rápida, preços ótimos, embalagens de qualidade na entrega. Super recomendo.",
  },
  {
    name: "Odonto Excellence Apucarana - ll",
    quote:
      "Sempre pedimos produtos. Além da qualidade, o custo-benefício e o atendimento são excelentes! Super indicamos! ❤️🌟",
  },
  {
    name: "Lucas Schmidt",
    quote:
      "A atendente Solange foi super atenciosa, conseguiu preços competitivos para mim! Com certeza voltarei a comprar com eles.",
  },
];

const easeOut = [0.22, 1, 0.36, 1] as const;
const LOOPING_TESTIMONIALS = [...TESTIMONIALS, ...TESTIMONIALS];

const TestimonialsSectionExactyMed = () => {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const isSectionInView = useInView(sectionRef, { amount: 0.2, margin: "180px 0px" });
  const marqueeItems = prefersReducedMotion ? TESTIMONIALS : LOOPING_TESTIMONIALS;

  return (
    <section
      ref={sectionRef}
      id="depoimentos"
      className="exacty-section-blend relative overflow-hidden bg-transparent py-20 text-white md:py-24 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,4,15,0.68)_0%,rgba(11,7,19,0.42)_38%,rgba(7,4,15,0.74)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(140,92,255,0.15),transparent_30%),radial-gradient(circle_at_bottom,rgba(94,51,201,0.12),transparent_28%)]" />
        <div className="absolute left-1/2 top-16 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[100px] md:h-[420px] md:w-[420px] md:blur-[124px]" />
        <div className="absolute right-[10%] top-1/3 h-[300px] w-[300px] rounded-full bg-fuchsia-500/7 blur-[104px]" />
        <div className="absolute left-1/2 bottom-0 h-24 w-[min(900px,90vw)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(120,76,226,0.08),rgba(120,76,226,0.02)_46%,transparent_74%)] blur-[40px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.72, ease: easeOut }}
          className="mx-auto max-w-4xl text-center text-white"
        >
          <p className="relative mx-auto mb-6 w-fit max-w-full overflow-hidden rounded-full border border-[rgba(145,115,220,0.1)] bg-[linear-gradient(180deg,rgba(23,16,35,0.78),rgba(11,8,18,0.66))] px-5 py-2 text-[10px] font-medium uppercase tracking-[0.24em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_12px_34px_rgba(15,8,29,0.24)] backdrop-blur-[22px] sm:px-6 sm:py-2.5 sm:text-[11px]">
            <span className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012)_34%,rgba(255,255,255,0)_100%)]" />
            <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(167,126,255,0.12),transparent_58%)] opacity-75" />
            <span className="pointer-events-none absolute -left-8 top-1/2 h-10 w-24 -translate-y-1/2 rotate-[-12deg] rounded-full bg-[rgba(255,255,255,0.035)] blur-2xl opacity-50" />
            <span className="pointer-events-none absolute right-6 top-0 h-8 w-8 rounded-full bg-violet-400/8 blur-2xl" />
            <span className="relative z-10 block text-center">DEPOIMENTOS DE PROFISSIONAIS ATENDIDOS</span>
          </p>

          <h2 className="text-center text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl md:text-[3rem] lg:text-[3.45rem]">
            Quem compra com a{" "}
            <span className="bg-[linear-gradient(180deg,#F6EEFF_0%,#D5B6FF_44%,#A76CFF_100%)] bg-clip-text text-transparent">
              Exacty Med
            </span>{" "}
            recomenda
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-balance text-sm leading-relaxed text-[rgba(252,248,255,0.9)] sm:text-base">
            Atendimento ágil, entrega rápida e produtos confiáveis para profissionais da estética avançada.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.76, delay: 0.08, ease: easeOut }}
          className="mt-11 md:mt-13"
        >
          <div className="testimonials-marquee-shell relative overflow-hidden py-3">
            <div
              className={
                prefersReducedMotion
                  ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                  : `${isSectionInView ? "testimonials-marquee-row " : ""}flex w-max items-stretch gap-4 md:gap-5`
              }
              style={
                prefersReducedMotion || !isSectionInView
                  ? undefined
                  : ({
                      "--marquee-duration": "176s",
                    } as React.CSSProperties)
              }
            >
              {marqueeItems.map((item, index) => (
                <article
                  key={`${item.name}-${index}`}
                  aria-hidden={!prefersReducedMotion && index >= TESTIMONIALS.length ? true : undefined}
                  className="group relative w-[min(86vw,360px)] shrink-0 overflow-hidden rounded-[28px] border border-[rgba(142,112,214,0.11)] bg-[linear-gradient(180deg,rgba(21,14,32,0.82),rgba(10,7,17,0.7))] px-5 py-5 text-white backdrop-blur-[20px] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_24px_68px_rgba(22,12,45,0.26)] transition-all duration-500 ease-out hover:-translate-y-1 hover:border-[rgba(166,133,245,0.18)] hover:bg-[linear-gradient(180deg,rgba(24,16,36,0.84),rgba(11,8,18,0.74))] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_30px_84px_rgba(55,30,116,0.28)] sm:w-[380px] md:w-[420px] md:px-6 md:py-5"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.008)_34%,rgba(255,255,255,0)_100%)] opacity-80" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,128,255,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(108,61,210,0.08),transparent_36%)] opacity-95" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)] opacity-70" />
                  <div className="pointer-events-none absolute -top-14 right-8 h-24 w-24 rounded-full bg-violet-400/9 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative z-10 flex h-full flex-col">
                    <p className="font-display text-[1.02rem] font-semibold tracking-[-0.022em] text-white md:text-[1.08rem]">
                      {item.name}
                    </p>
                    <p className="mt-3 text-[0.95rem] leading-[1.6] text-[rgba(248,244,255,0.94)] md:text-[0.98rem] md:leading-[1.65]">
                      {item.quote}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSectionExactyMed;
