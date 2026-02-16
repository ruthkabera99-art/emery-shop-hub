import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  bucket?: string;
}

const SUPABASE_URL = "https://oohqsyawrdwddjmcenes.supabase.co";

const ImageUploader = ({ images, onImagesChange, maxImages = 10, bucket = "product-images" }: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getPublicUrl = (path: string) =>
    `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      toast({ title: "Limit reached", description: `Maximum ${maxImages} images allowed.`, variant: "destructive" });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    setProgress(0);

    const newUrls: string[] = [];
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (error) {
        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      } else {
        newUrls.push(getPublicUrl(fileName));
      }
      setProgress(Math.round(((i + 1) / filesToUpload.length) * 100));
    }

    if (newUrls.length > 0) {
      onImagesChange([...images, ...newUrls]);
      toast({ title: "Uploaded", description: `${newUrls.length} image${newUrls.length > 1 ? "s" : ""} uploaded successfully.` });
    }

    setUploading(false);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          Images ({images.length}/{maxImages})
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading || images.length >= maxImages}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Upload className="h-3 w-3 mr-1" />}
          {uploading ? "Uploading..." : "Upload"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {uploading && <Progress value={progress} className="h-1.5" />}

      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
              <img src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground font-medium">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-accent/50 transition-colors"
        >
          <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Click or drag to upload images</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to 5MB each</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
