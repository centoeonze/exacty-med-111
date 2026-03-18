import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getWhatsAppUrl } from "./WhatsAppLink";

const easeOut = [0.22, 1, 0.36, 1] as const;

const FinalCTASection = () => (
  <section className="exacty-section-blend relative overflow-hidden bg-transparent py-16 md:py-20 lg:py-24">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(143,92,255,0.16),transparent_36%),linear-gradient(180deg,rgba(7,3,15,0.72)_0%,rgba(9,4,20,0.62)_100%)]" />
      <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[150px] md:h-[460px] md:w-[460px]" />
      <div className="absolute left-[14%] top-[18%] h-[180px] w-[180px] rounded-full bg-fuchsia-500/6 blur-[110px]" />
      <div className="absolute right-[12%] bottom-[16%] h-[200px] w-[200px] rounded-full bg-violet-400/8 blur-[120px]" />
      <div className="absolute inset-x-0 -top-16 h-40 bg-[linear-gradient(180deg,rgba(7,4,15,0.48),rgba(15,10,24,0.14)_58%,transparent)] blur-[14px]" />
      <div className="absolute inset-x-0 -bottom-20 h-48 bg-[linear-gradient(0deg,rgba(7,4,15,0.56),rgba(15,10,24,0.18)_52%,transparent)] blur-[18px]" />
      <div className="absolute left-1/2 top-0 h-24 w-[min(860px,86vw)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(118,74,224,0.08),rgba(118,74,224,0.02)_46%,transparent_74%)] blur-[48px]" />
      <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(rgba(255,255,255,0.28)_0.8px,transparent_0.8px)] [background-size:26px_26px]" />
    </div>

    <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.72, ease: easeOut }}
        className="relative mx-auto max-w-[720px] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-6 text-center backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_80px_rgba(90,48,210,0.18)] sm:px-6 md:max-w-[820px] md:rounded-[32px] md:px-7 md:py-7 lg:max-w-[900px] lg:px-8 lg:py-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02)_38%,rgba(255,255,255,0.01)_100%)]" />
        <div className="pointer-events-none absolute -left-14 top-8 h-28 w-28 rounded-full bg-white/7 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-violet-400/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-[14%] bottom-0 h-16 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.14),rgba(139,92,246,0.04)_50%,transparent_72%)] blur-2xl" />

        <div className="relative z-10 flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1.55fr)_minmax(250px,0.9fr)] lg:items-center lg:gap-8">
          <div className="mx-auto max-w-[640px] lg:mx-0 lg:max-w-[620px] lg:text-left">
            <motion.h2
              initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.66, delay: 0.06, ease: easeOut }}
              className="font-display text-[1.2rem] font-semibold leading-[1.12] tracking-[-0.028em] text-white sm:text-[1.3rem] md:text-[1.55rem] lg:text-[1.72rem]"
            >
              Quando você aplica um injetável, o resultado depende não apenas da técnica, mas da procedência,
              conservação e confiabilidade do produto.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.58, delay: 0.14, ease: easeOut }}
              className="mx-auto mt-3 max-w-[620px] text-center text-[0.92rem] leading-6 text-white/75 md:text-[0.98rem] lg:mx-0 lg:mt-3.5 lg:text-left"
            >
              Com a Exacty Med, você trabalha com estoque disponível, NF e lote rastreável, sem comprometer sua
              agenda.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.56, delay: 0.24, ease: easeOut }}
            className="flex justify-center lg:h-full lg:items-center lg:justify-center lg:self-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.018, 1],
                filter: [
                  "drop-shadow(0 0 0 rgba(123,67,255,0))",
                  "drop-shadow(0 0 16px rgba(123,67,255,0.16))",
                  "drop-shadow(0 0 0 rgba(123,67,255,0))",
                ],
              }}
              transition={{
                duration: 4.2,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 0.6,
              }}
              className="flex justify-center"
            >
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-white/14 bg-[linear-gradient(135deg,#8B5CF6_0%,#6D28D9_45%,#A78BFA_100%)] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(123,67,255,0.35),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_22px_65px_rgba(123,67,255,0.42),inset_0_1px_0_rgba(255,255,255,0.22)] md:px-8 md:py-4"
              >
                Falar com um consultor agora
                <ArrowRight size={17} className="transition-transform duration-500 group-hover:translate-x-0.5" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default FinalCTASection;
