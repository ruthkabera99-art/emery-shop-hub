import { useState, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  eager?: boolean;
}

const OptimizedImage = ({ src, alt, eager = false, className, ...props }: OptimizedImageProps) => {
  const [loaded, setLoaded] = useState(false);

  // Generate WebP source for Supabase storage URLs
  const isSupabaseUrl = src?.includes("supabase.co/storage");
  const webpSrc = isSupabaseUrl ? `${src}?format=webp` : undefined;

  return (
    <picture>
      {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding={eager ? "sync" : "async"}
        onLoad={() => setLoaded(true)}
        className={cn(
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
        {...props}
      />
    </picture>
  );
};

export default OptimizedImage;
