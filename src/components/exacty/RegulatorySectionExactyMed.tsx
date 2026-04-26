import { motion } from "framer-motion";
import { Download, FileBadge2 } from "lucide-react";

type RegulatoryDocument = {
  title: string;
  description: string;
  fileType: string;
  fileUrl?: string;
};

const DOCUMENTS: RegulatoryDocument[] = [
  {
    title: "Licença de Funcionamento",
    description: "Documento para comprovação de regularidade operacional e funcionamento.",
    fileType: "PDF",
    fileUrl: "/regulatorio/placeholder-licenca-funcionamento.pdf",
  },
  {
    title: "Autorização de Funcionamento (AFE)",
    description: "Autorização aplicável para atividades reguladas e distribuição no segmento de saúde.",
    fileType: "PDF",
    fileUrl: "/regulatorio/placeholder-afe.pdf",
  },
  {
    title: "Certificado / Declaração de Regularidade",
    description: "Documento técnico para apoio em processos de cadastro e qualificação de fornecedores.",
    fileType: "PDF",
    fileUrl: "/regulatorio/placeholder-regularidade.pdf",
  },
];

const easeOut = [0.22, 1, 0.36, 1] as const;

const RegulatorySectionExactyMed = () => (
  <section
    id="regulatorio"
    className="exacty-section-blend relative overflow-hidden bg-transparent py-24 md:py-28 lg:py-32"
  >
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,5,13,0.72)_0%,rgba(11,7,18,0.44)_40%,rgba(7,5,13,0.72)_100%)]" />
      <div className="absolute left-1/2 top-16 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[108px]" />
      <div className="absolute left-1/2 top-1/3 h-[480px] w-[760px] -translate-x-1/2 rounded-full bg-purple-500/10 blur-[148px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.14),transparent_34%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:18px_18px] opacity-[0.03]" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(to_top,rgba(7,5,13,0.62),transparent)]" />
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
          DOCUMENTAÇÃO E CONFORMIDADE
        </p>
        <h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl md:text-6xl">
          <span className="bg-gradient-to-r from-white via-[#E9DEFD] to-violet-400 bg-clip-text text-transparent">
            Regulatório
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
          Documentos, licenças e certificações que comprovam nossa regularidade para distribuição de produtos de saúde e
          medicamentos.
        </p>
      </motion.div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {DOCUMENTS.map((doc) => {
          const isAvailable = Boolean(doc.fileUrl);

          return (
            <motion.div
              key={doc.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: easeOut }}
              className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            >
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_26%,rgba(0,0,0,0.34)_100%)] opacity-80" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_40%_16%,rgba(139,92,246,0.20),transparent_46%)]" />

              <div className="relative z-10 flex flex-1 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-violet-500/10 text-violet-200 shadow-[0_0_26px_rgba(139,92,246,0.14)]">
                  <FileBadge2 className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-violet-200/70">
                    {doc.fileType}
                  </p>
                  <h3 className="mt-2 text-base font-semibold leading-6 text-zinc-50">{doc.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{doc.description}</p>
                </div>
              </div>

              <div className="relative z-10 mt-auto pt-8">
                {isAvailable ? (
                  <a
                    href={doc.fileUrl}
                    download
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#8b5cf6_0%,#6d28d9_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(139,92,246,0.22)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_18px_40px_rgba(139,92,246,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07050D]"
                  >
                    Baixar documento
                    <Download className="h-4 w-4" />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/40"
                  >
                    Documento indisponível
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default RegulatorySectionExactyMed;

