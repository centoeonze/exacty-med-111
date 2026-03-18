const TRUST_ITEMS = [
  {
    title: "Nota fiscal e lote rastreável",
    desc: "Procedência garantida em cada produto.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
      </svg>
    ),
  },
  {
    title: "Armazenamento e envio adequado",
    desc: "Controle rigoroso de temperatura.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 14.76V3.5a2 2 0 0 0-4 0v11.26a4 4 0 1 0 4 0z" />
      </svg>
    ),
  },
  {
    title: "Estoque disponível",
    desc: "Para não travar sua agenda.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Consultores especializados",
    desc: "Atendimento direto e personalizado.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 18v-6a2 2 0 0 1 2-2h3" />
        <path d="M21 18v-6a2 2 0 0 0-2-2h-3" />
        <path d="M8 10V8a4 4 0 1 1 8 0v2" />
        <path d="M8 18v-2" />
        <path d="M16 18v-2" />
      </svg>
    ),
  },
];

const TrustSectionExactyMed = () => (
  <section
    id="confianca"
    className="exacty-section-blend relative overflow-hidden bg-transparent py-24 md:py-28 lg:py-32"
  >
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,5,13,0.74)_0%,rgba(11,7,18,0.48)_40%,rgba(7,5,13,0.72)_100%)]" />
      <div className="absolute left-1/2 top-10 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px] md:h-[420px] md:w-[420px] md:blur-[150px]" />
      <div className="absolute left-1/2 top-[26%] h-[440px] w-[760px] -translate-x-1/2 rounded-full bg-purple-500/10 blur-[180px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.14),transparent_34%)]" />
      <div className="absolute inset-x-0 -top-16 h-44 bg-[linear-gradient(180deg,rgba(7,5,13,0.5),rgba(16,10,25,0.16)_58%,transparent)] blur-[14px]" />
      <div className="absolute inset-x-0 -bottom-20 h-52 bg-[linear-gradient(0deg,rgba(7,5,13,0.56),rgba(16,10,25,0.18)_52%,transparent)] blur-[18px]" />
      <div className="absolute left-1/2 bottom-0 h-28 w-[min(880px,88vw)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(118,74,224,0.08),rgba(118,74,224,0.02)_46%,transparent_74%)] blur-[48px]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(rgba(255,255,255,0.32)_0.8px,transparent_0.8px)] [background-size:28px_28px]" />
    </div>

    <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
      <div className="mx-auto mb-14 max-w-5xl overflow-visible text-center md:mb-16 lg:mb-20">
        <p className="relative mx-auto mb-7 w-fit max-w-full overflow-hidden rounded-full border border-white/12 bg-white/[0.045] px-5 py-2 text-[10px] font-medium uppercase tracking-[0.24em] text-zinc-300/80 shadow-[0_10px_35px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:px-6 sm:py-2.5 sm:text-[11px] md:px-7 md:py-3">
          <span className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04)_36%,rgba(255,255,255,0.02)_100%)]" />
          <span className="pointer-events-none absolute inset-[1px] rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_58%)] opacity-80" />
          <span className="pointer-events-none absolute -left-8 top-1/2 h-10 w-24 -translate-y-1/2 rotate-[-12deg] rounded-full bg-white/10 blur-2xl opacity-40" />
          <span className="pointer-events-none absolute right-6 top-0 h-8 w-8 rounded-full bg-violet-400/10 blur-2xl" />
          <span className="relative z-10 block text-center">
            Estrutura operacional para clínicas e profissionais habilitados
          </span>
        </p>

        <h2 className="mx-auto max-w-4xl overflow-visible pb-[0.04em] text-center text-4xl font-semibold leading-[1.11] tracking-[-0.045em] text-zinc-50 sm:text-5xl md:text-6xl lg:text-[68px]">
          <span className="inline-block overflow-visible pb-[0.08em] bg-[linear-gradient(180deg,#e9defd_0%,#c8a9ff_46%,#8b5cf6_100%)] bg-clip-text text-transparent [-webkit-text-fill-color:transparent]">
            Segurança operacional
          </span>
          <br className="hidden md:block" />
          <span className="text-zinc-50">
            {" "}para quem trabalha com estética avançada
          </span>
        </h2>

      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-1/2 top-10 h-[220px] w-[90%] -translate-x-1/2 rounded-[40px] bg-violet-500/6 blur-3xl" />

        <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {TRUST_ITEMS.map((item) => (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.34)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/[0.055] hover:shadow-[0_28px_80px_rgba(76,29,149,0.22)]"
            >
              <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),transparent_28%,transparent_100%)] opacity-70" />
              <span className="pointer-events-none absolute -top-12 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300 shadow-[0_0_30px_rgba(139,92,246,0.12)]">
                  {item.icon}
                </div>

                <h3 className="min-h-[3.45rem] text-2xl font-semibold leading-[1.08] tracking-[-0.03em] text-zinc-100">
                  {item.title}
                </h3>

                <p className="mt-2 text-[0.98rem] leading-6 text-zinc-400">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default TrustSectionExactyMed;
