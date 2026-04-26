import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import logo from "@/assets/logoexactybranca.svg";
import { getWhatsAppUrl } from "./WhatsAppLink";

const NAV_LINKS = [
  { label: "Produtos", href: "#produtos" },
  { label: "Entrega", href: "#confianca" },
  { label: "Sobre", href: "#sobre" },
  { label: "Regulatório", href: "#regulatorio" },
  { label: "Depoimentos", href: "#depoimentos" },
];

const NavbarExactyMed = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <nav className="hero-navbar-shell flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="#hero" className="flex items-center" onClick={() => setOpen(false)}>
            <img
              src={logo}
              alt="Exacty Med"
              width={156}
              height={40}
              loading="eager"
              decoding="async"
              className="h-7 w-auto sm:h-8 md:h-9"
            />
          </a>

          <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="hero-nav-link px-4 py-2 text-sm font-medium">
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-cta-primary hero-cta-primary-compact hidden items-center justify-center px-5 py-3 text-sm font-semibold text-white lg:inline-flex"
            >
              Entre em contato
            </a>

            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="hero-menu-button inline-flex items-center justify-center lg:hidden"
              aria-expanded={open}
              aria-label={open ? "Fechar menu" : "Abrir menu"}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="hero-mobile-drawer mt-3 px-5 pb-6 pt-4 lg:hidden"
            >
              <div className="flex flex-col gap-2">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="hero-nav-link rounded-2xl px-4 py-3 text-sm font-medium"
                  >
                    {link.label}
                  </a>
                ))}

                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-cta-primary mt-3 inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-white"
                  onClick={() => setOpen(false)}
                >
                  Entre em contato
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NavbarExactyMed;
