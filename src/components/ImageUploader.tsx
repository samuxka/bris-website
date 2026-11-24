import { useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Loader2,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { uploadImagesToCloudinary } from '../lib/supabase';

interface ImageUploaderProps {
  images: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  folder?: string;
  label?: string;
  helperText?: string;
}

export function ImageUploader({
  images,
  onChange,
  multiple = true,
  folder = 'bris-pastelaria',
  label = 'Imagens',
  helperText = 'Arraste arquivos aqui ou clique para selecionar (JPG, PNG, WebP até 8MB)',
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function processFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    const files = Array.from(fileList);
    const toUpload = multiple ? files : [files[0]];

    setUploading(true);
    try {
      const uploadedUrls = await uploadImagesToCloudinary(toUpload, folder);
      if (multiple) {
        onChange([...images, ...uploadedUrls]);
      } else {
        onChange(uploadedUrls.slice(0, 1));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao enviar imagens. Tente novamente.'
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function removeAt(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= images.length) return;
    const copy = [...images];
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    onChange(copy);
  }

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-[#071f3b]">
          {label}
        </label>
      )}

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          void processFiles(e.dataTransfer.files);
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-[#0d4380] bg-[#eef4fc]'
            : 'border-[#cbd9ec] bg-[#f8fafd] hover:border-[#0d4380] hover:bg-[#f1f6fd]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple={multiple}
          onChange={(e) => void processFiles(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="w-7 h-7 text-[#0d4380] animate-spin" />
            <p className="text-xs font-semibold text-[#0d4380]">
              Enviando imagens com segurança para o Cloudinary...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-11 h-11 rounded-xl bg-white border border-[#dce6f2] text-[#0d4380] flex items-center justify-center shadow-xs">
              {multiple ? (
                <UploadCloud className="w-5 h-5" />
              ) : (
                <ImagePlus className="w-5 h-5" />
              )}
            </div>
            <p className="text-xs font-bold text-[#071f3b]">
              {multiple
                ? 'Clique ou arraste múltiplas imagens aqui'
                : 'Clique ou arraste uma imagem aqui'}
            </p>
            <p className="text-[11px] text-[#647b96]">{helperText}</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2">
          {error}
        </p>
      )}

      {/* Uploaded Previews */}
      {images.length > 0 && (
        <div
          className={`grid gap-3 ${
            multiple ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 max-w-xs'
          }`}
        >
          {images.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="relative group rounded-xl overflow-hidden border border-[#dce6f2] bg-[#f4f7fb] aspect-square"
            >
              <img
                src={url}
                alt={`Upload ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {multiple && idx === 0 && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#0d4380] text-white text-[10px] font-bold">
                  Capa
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-[#061e3c]/80 to-transparent flex items-center justify-between gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1">
                  {multiple && idx > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveImage(idx, idx - 1);
                      }}
                      title="Mover para esquerda"
                      className="p-1 rounded-md bg-white/90 text-[#071f3b] hover:bg-white cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  )}
                  {multiple && idx < images.length - 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveImage(idx, idx + 1);
                      }}
                      title="Mover para direita"
                      className="p-1 rounded-md bg-white/90 text-[#071f3b] hover:bg-white cursor-pointer"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAt(idx);
                  }}
                  title="Remover imagem"
                  className="p-1 rounded-md bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
