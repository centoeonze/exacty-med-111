import * as React from "react";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import { AUTOPLAY_DELAY, PORTFOLIO_ITEMS, type PortfolioItem } from "./productPortfolioData";

const easeOut = [0.22, 1, 0.36, 1] as const;
const loadPortfolioModal = () => import("./ProductPortfolioModal");
const ProductPortfolioModal = React.lazy(loadPortfolioModal);

type PortfolioCardProps = {
  item: PortfolioItem;
  index: number;
  isActive: boolean;
  onSelect: (index: number) => void;
  onPrefetchModal: () => void;
};

const PortfolioCard = React.memo(({ item, index, isActive, onSelect, onPrefetchModal }: PortfolioCardProps) => {
  const handleClick = React.useCallback(() => {
    onSelect(index);
  }, [index, onSelect]);

  return (
    <CarouselItem className="basis-[66%] py-4 pl-4 sm:basis-[44%] sm:py-5 lg:basis-[30%] lg:py-6 xl:basis-[26%]">
      <button
        type="button"
        aria-haspopup="dialog"
        onMouseEnter={onPrefetchModal}
        onFocus={onPrefetchModal}
        onClick={handleClick}
        className={cn(
          "group relative w-full overflow-hidden rounded-[32px] border bg-white/[0.04] text-left backdrop-blur-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07050D]",
          "aspect-[0.72/1]",
          isActive
            ? "scale-[1.02] border-violet-400/40 shadow-[0_30px_100px_rgba(139,92,246,0.22)]"
            : "border-white/10 opacity-80 hover:border-white/20 hover:opacity-100",
        )}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_28%,rgba(0,0,0,0.34)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(139,92,246,0.2),transparent_42%)]" />
        <div className="absolute inset-3 rounded-[26px] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))]" />

        <div
          className={cn(
            "absolute inset-0 rounded-[32px] transition-opacity duration-300",
            isActive
              ? "bg-[linear-gradient(140deg,rgba(255,255,255,0.12),transparent_18%,rgba(139,92,246,0.12)_58%,rgba(255,255,255,0.02)_100%)] opacity-100"
              : "opacity-0",
          )}
        />

        <div className="absolute inset-x-4 top-4 bottom-[4.4rem] z-10 flex items-center justify-center sm:inset-x-5 sm:top-5 sm:bottom-[4.9rem]">
          <img
            src={item.image.src}
            alt={item.title}
            width={item.image.width}
            height={item.image.height}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain object-center px-2 py-2 transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>

        <div className="absolute inset-x-3 bottom-3 z-20 rounded-[20px] border border-white/10 bg-[linear-gradient(135deg,rgba(12,10,20,0.74),rgba(25,18,39,0.44))] px-4 py-3 backdrop-blur-lg sm:inset-x-4 sm:bottom-4">
          <p className="text-[0.62rem] uppercase tracking-[0.24em] text-violet-200/70">Categoria</p>
          <p className="mt-1 text-sm font-medium leading-5 text-zinc-100">{item.title}</p>
        </div>
      </button>
    </CarouselItem>
  );
});

PortfolioCard.displayName = "PortfolioCard";

const ProductPortfolioSection = () => {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const [api, setApi] = React.useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const isSectionInView = useInView(sectionRef, { amount: 0.2, margin: "200px 0px" });

  const selectedItem = React.useMemo(
    () => (selectedIndex !== null ? PORTFOLIO_ITEMS[selectedIndex] : null),
    [selectedIndex],
  );

  const syncActiveSlide = React.useCallback(() => {
    if (!api) {
      return;
    }

    setActiveIndex(api.selectedScrollSnap());
  }, [api]);

  const handleSelectProduct = React.useCallback(
    (index: number) => {
      setSelectedIndex(index);
      setIsModalOpen(true);
      api?.scrollTo(index);
    },
    [api],
  );

  const handleCloseModal = React.useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handlePrefetchModal = React.useCallback(() => {
    void loadPortfolioModal();
  }, []);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    syncActiveSlide();
    api.on("select", syncActiveSlide);
    api.on("reInit", syncActiveSlide);

    return () => {
      api.off("select", syncActiveSlide);
      api.off("reInit", syncActiveSlide);
    };
  }, [api, syncActiveSlide]);

  React.useEffect(() => {
    if (!api || isModalOpen || !isSectionInView) {
      return;
    }

    const interval = window.setInterval(() => {
      api.scrollNext();
    }, AUTOPLAY_DELAY);

    return () => {
      window.clearInterval(interval);
    };
  }, [api, isModalOpen, isSectionInView]);

  React.useEffect(() => {
    if (isSectionInView) {
      handlePrefetchModal();
    }
  }, [handlePrefetchModal, isSectionInView]);

  return (
    <>
      <section
        ref={sectionRef}
        id="produtos"
        className="exacty-section-blend relative overflow-hidden bg-transparent py-24 md:py-28 lg:py-32"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,5,13,0.72)_0%,rgba(11,7,18,0.44)_38%,rgba(7,5,13,0.72)_100%)]" />
          <div className="absolute left-1/2 top-16 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-violet-600/18 blur-[108px]" />
          <div className="absolute left-1/2 top-1/3 h-[480px] w-[760px] -translate-x-1/2 rounded-full bg-purple-500/10 blur-[148px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.16),transparent_34%)]" />
          <div className="absolute left-1/2 bottom-0 h-28 w-[min(920px,90vw)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(122,78,228,0.08),rgba(122,78,228,0.02)_48%,transparent_76%)] blur-[40px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:18px_18px] opacity-[0.035]" />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(to_top,rgba(7,5,13,0.62),transparent)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.72, ease: easeOut }}
            className="mx-auto mb-12 max-w-6xl text-center md:mb-16"
          >
            <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.28em] text-violet-200/70">
              PORTFÓLIO ESPECIALIZADO PARA ESTÉTICA AVANÇADA
            </p>

            <h2 className="mx-auto max-w-6xl text-center text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-50 sm:text-5xl md:text-6xl lg:whitespace-nowrap">
              <span className="text-zinc-50">Explore o portfólio da </span>
              <span className="bg-[linear-gradient(180deg,#e9defd_0%,#d4b5ff_35%,#a855f7_68%,#7c3aed_100%)] bg-clip-text text-transparent">
                Exacty Med
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-5xl text-center text-sm leading-7 text-zinc-400 sm:text-base lg:whitespace-nowrap">
              Selecione uma categoria para visualizar detalhes do produto, elegibilidade profissional e informações
              técnicas.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.08, ease: easeOut }}
            className="relative mx-auto max-w-[1240px]"
          >
            <div className="pointer-events-none absolute left-1/2 top-[42%] z-0 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/16 blur-[96px] sm:h-[400px] sm:w-[400px]" />
            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-24 bg-gradient-to-r from-[#07050D] via-[#07050D]/92 to-transparent md:block" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-24 bg-gradient-to-l from-[#07050D] via-[#07050D]/92 to-transparent md:block" />

            <div className="px-2 sm:px-4 md:px-10 lg:px-14">
              <Carousel
                setApi={setApi}
                opts={{
                  align: "center",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="cursor-grab items-stretch active:cursor-grabbing will-change-transform">
                  {PORTFOLIO_ITEMS.map((item, index) => (
                    <PortfolioCard
                      key={item.title}
                      item={item}
                      index={index}
                      isActive={activeIndex === index}
                      onSelect={handleSelectProduct}
                      onPrefetchModal={handlePrefetchModal}
                    />
                  ))}
                </CarouselContent>

                <CarouselPrevious
                  variant="ghost"
                  className="left-2 z-30 h-11 w-11 rounded-full border border-white/10 bg-white/[0.06] text-zinc-100 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-lg transition-all duration-300 hover:border-violet-300/30 hover:bg-violet-500/12 hover:text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.18)] disabled:opacity-0 sm:left-4 md:left-6"
                />
                <CarouselNext
                  variant="ghost"
                  className="right-2 z-30 h-11 w-11 rounded-full border border-white/10 bg-white/[0.06] text-zinc-100 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-lg transition-all duration-300 hover:border-violet-300/30 hover:bg-violet-500/12 hover:text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.18)] disabled:opacity-0 sm:right-4 md:right-6"
                />
              </Carousel>
            </div>
          </motion.div>

          <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-6 text-zinc-500">
            Todos os produtos são comercializados exclusivamente para profissionais habilitados, conforme exigência
            regulatória.
          </p>
        </div>
      </section>

      <React.Suspense fallback={null}>
        <ProductPortfolioModal isOpen={isModalOpen} item={selectedItem} onClose={handleCloseModal} />
      </React.Suspense>
    </>
  );
};

export default ProductPortfolioSection;
