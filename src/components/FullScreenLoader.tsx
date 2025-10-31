import { Loader2 } from "lucide-react";

interface FullScreenLoaderProps {
  label?: string;
  sublabel?: string;
}

const FullScreenLoader = ({
  label = "جاري تحميل البيانات...",
  sublabel,
}: FullScreenLoaderProps) => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white"
      dir="rtl"
    >
      <div className="rounded-full bg-white/5 p-4 mb-4">
        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-white" />
      </div>
      <p className="text-sm sm:text-base font-medium text-white/90">{label}</p>
      {sublabel ? (
        <p className="mt-2 text-xs sm:text-sm text-white/60 max-w-sm text-center leading-relaxed">
          {sublabel}
        </p>
      ) : null}
    </div>
  );
};

export default FullScreenLoader;
