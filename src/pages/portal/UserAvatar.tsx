import { useEffect, useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { apiImage } from "@/lib/api";

interface UserAvatarProps {
  userId: string;
  avatarPath?: string | null;
  nombre: string;
  size?: number;
  editable?: boolean;
  onUpload?: (file: File) => Promise<void>;
}

/** Avatar circular real (con fallback a iniciales) y, opcionalmente, subida de foto. */
export function UserAvatar({ userId, avatarPath, nombre, size = 36, editable, onUpload }: UserAvatarProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    if (avatarPath) {
      apiImage(`/users/avatar.php?id=${encodeURIComponent(userId)}`)
        .then((url) => {
          if (cancelled) { URL.revokeObjectURL(url); return; }
          objectUrl = url;
          setImgUrl(url);
        })
        .catch(() => { if (!cancelled) setImgUrl(null); });
    } else {
      setImgUrl(null);
    }
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [avatarPath, userId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={nombre}
          className="w-full h-full rounded-full object-cover border border-amber-200"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center">
          <span className="font-bold text-amber-700" style={{ fontSize: size * 0.4 }}>
            {nombre[0]?.toUpperCase()}
          </span>
        </div>
      )}

      {editable && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-slate-900 text-white
                       flex items-center justify-center border-2 border-white hover:bg-slate-700
                       transition-colors disabled:opacity-70"
            title="Cambiar foto"
          >
            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-2.5 h-2.5" />}
          </button>
        </>
      )}
    </div>
  );
}
