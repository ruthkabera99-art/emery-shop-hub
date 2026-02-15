import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { getImage } from "@/lib/images";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  productName: string;
}

const ImageModal = ({ isOpen, onClose, images, initialIndex = 0, productName }: ImageModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const next = () => setCurrentIndex((i) => (i + 1) % images.length);
  const prev = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-2xl w-full bg-card rounded-xl overflow-hidden shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-3 right-3 z-10 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
              <X className="h-5 w-5" />
            </button>

            <div className="relative aspect-square">
              <img
                src={getImage(images[currentIndex])}
                alt={`${productName} - Image ${currentIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-display text-lg font-bold">{productName}</h3>
              {images.length > 1 && (
                <div className="flex gap-2 mt-3">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`w-14 h-14 rounded-md overflow-hidden border-2 transition-colors ${i === currentIndex ? "border-accent" : "border-transparent opacity-60 hover:opacity-100"}`}
                    >
                      <img src={getImage(img)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageModal;
