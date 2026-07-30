import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface HeroImageSliderProps {
  images: string[];
  intervalMs?: number;
}

/** Slider automático de fondo (crossfade), usado en los hero de Dashboard y Empresa. */
export function HeroImageSlider({ images, intervalMs = 5000 }: HeroImageSliderProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  return (
    <AnimatePresence>
      <motion.img
        key={index}
        src={images[index]}
        alt=""
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </AnimatePresence>
  );
}
