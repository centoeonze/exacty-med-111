const WHATSAPP_NUMBER = "5543999999999"; // Replace with actual number
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Olá, vim pelo site e gostaria de solicitar a tabela e disponibilidade dos produtos."
);

export const getWhatsAppUrl = () =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

export default getWhatsAppUrl;
