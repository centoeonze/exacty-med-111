import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "./WhatsAppLink";

const FloatingWhatsAppButton = () => (
  <a
    href={getWhatsAppUrl()}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Fale conosco pelo WhatsApp"
    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 animate-pulse-glow"
    style={{ background: "#25D366" }}
  >
    <MessageCircle size={26} className="text-primary-foreground" />
  </a>
);

export default FloatingWhatsAppButton;
