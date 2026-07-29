import { motion } from "framer-motion";
import { buildWhatsAppLink, WhatsAppIcon } from "@/lib/whatsapp";

const WhatsAppFloatButton = () => {
  return (
    <motion.a
      href={buildWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos al WhatsApp"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="fixed right-5 sm:right-7 bottom-[78px] sm:bottom-[94px] z-40
                 w-11 h-11 sm:w-12 sm:h-12 rounded-full
                 flex items-center justify-center
                 bg-[#25D366] text-white
                 shadow-[0_4px_22px_rgba(37,211,102,0.45)]
                 hover:shadow-[0_6px_30px_rgba(37,211,102,0.62)]
                 transition-shadow duration-200"
    >
      <WhatsAppIcon className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
    </motion.a>
  );
};

export default WhatsAppFloatButton;
