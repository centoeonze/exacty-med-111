import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "./WhatsAppLink";

const FloatingWhatsAppButton = () => (
  <a
    href={getWhatsAppUrl()}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Fale conosco pelo WhatsApp"
    className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-[0_18px_40px_rgba(37,211,102,0.32)] transition-all hover:scale-110 active:scale-95 will-change-transform animate-whatsapp-float"
    style={{ background: "#25D366" }}
  >
    <MessageCircle size={26} className="text-primary-foreground" />
  </a>
);

export default FloatingWhatsAppButton;
