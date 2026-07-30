import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Megaphone, Upload, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, apiImage } from "@/lib/api";
import { PortalTopNav, PORTAL_NAV_ITEMS } from "./PortalTopNav";

export default function PortalPublicidad() {
  const { currentUser, loading, uploadAd } = useAuth();
  const navigate = useNavigate();
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!currentUser) { navigate("/portal", { replace: true }); return; }
    const isAdmin = currentUser.role === "admin" || currentUser.role === "super_admin";
    if (!isAdmin) navigate("/portal/dashboard", { replace: true });
  }, [currentUser, loading, navigate]);

  const loadAd = () => {
    let objectUrl: string | null = null;
    apiFetch<{ hasAd: boolean }>("/ads/current.php")
      .then((data) => {
        if (!data.hasAd) { setChecking(false); return; }
        return apiImage("/ads/image.php").then((url) => {
          objectUrl = url;
          setImgUrl(url);
          setChecking(false);
        });
      })
      .catch(() => setChecking(false));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  };

  useEffect(() => {
    const cleanup = loadAd();
    return cleanup;
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const res = await uploadAd(file);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!res.ok) { setError(res.error ?? "Error al subir el anuncio."); return; }
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    setImgUrl(null);
    setChecking(true);
    loadAd();
  };

  if (loading || !currentUser) return null;
  const isAdmin = currentUser.role === "admin" || currentUser.role === "super_admin";
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="h-1 bg-gradient-to-r from-[hsl(40_82%_46%)] via-[hsl(44_80%_54%)] to-[hsl(40_82%_46%)]" />
      <PortalTopNav crumbs={[{ label: "Portal Empresarial" }]} navItems={PORTAL_NAV_ITEMS} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
            <Megaphone className="w-4 h-4 text-amber-700" />
          </div>
          <h1 className="font-display text-2xl tracking-[0.04em] text-gradient-gold">PUBLICIDAD</h1>
        </div>
        <p className="text-sm text-slate-500 ml-[42px] mb-6">
          Un solo anuncio activo (formato 9:16), visible para Cliente y Equipo en la vista de Empresa.
        </p>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 text-sm">Anuncio actual</h2>
          </div>

          <div className="p-6 flex flex-col sm:flex-row gap-6">
            <div className="w-full sm:w-[220px] shrink-0">
              <div className="w-full aspect-[9/16] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100
                              flex items-center justify-center">
                {checking ? (
                  <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                ) : imgUrl ? (
                  <img src={imgUrl} alt="Publicidad actual" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-xs text-slate-400 text-center px-4">Sin anuncio activo aún.</p>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Sube una imagen vertical (idealmente 1080×1920 o proporción 9:16).
                JPG, PNG o WEBP, máximo 5MB. Al subir una nueva, reemplaza automáticamente
                la que esté activa.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl
                           bg-amber-500 hover:bg-amber-600 text-white transition-colors
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Subiendo..." : imgUrl ? "Reemplazar anuncio" : "Subir anuncio"}
              </button>

              {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
