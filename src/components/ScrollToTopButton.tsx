import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useScrollPastSection } from "@/hooks/use-scroll-past-section";

const ScrollToTopButton = () => {
  const visible = useScrollPastSection("quienes-somos");

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Volver arriba"
          initial={{ opacity: 0, y: 16, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40
                     w-11 h-11 sm:w-12 sm:h-12 rounded-full
                     flex items-center justify-center
                     bg-gradient-to-r from-[hsl(40_82%_46%)] to-[hsl(44_80%_54%)]
                     text-black shadow-[0_4px_22px_hsl(43_78%_50%/0.45)]
                     hover:shadow-[0_6px_30px_hsl(43_78%_50%/0.62)]
                     transition-shadow duration-200"
        >
          <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;
