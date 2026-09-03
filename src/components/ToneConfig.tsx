import React from "react";
import { ToneOption } from "../types";
import { 
  Coffee, 
  ShieldCheck, 
  Laugh, 
  Smile, 
  Zap, 
  Briefcase, 
  Award 
} from "lucide-react";

interface ToneConfigProps {
  selectedToneId: string;
  onSelectTone: (id: string) => void;
}

export const toneOptions: ToneOption[] = [
  { id: "casual", name: "Giản dị", desc: "Thân thiện, hằng ngày, ấm áp", icon: "Coffee" },
  { id: "authentic", name: "Chân thật", desc: "Đánh giá chân thành, thực tế", icon: "ShieldCheck" },
  { id: "comedy_crazy", name: "Hài hước bựa", desc: "Hài hước, bắt trend độc lạ", icon: "Laugh" },
  { id: "comedy", name: "Hài hước", desc: "Dễ thương, dí dỏm, thông minh", icon: "Smile" },
  { id: "energy", name: "Năng lượng", desc: "Cuốn hút, hào hứng, lôi cuốn", icon: "Zap" },
  { id: "serious", name: "Nghiêm túc", desc: "Chuyên nghiệp, chi tiết vải", icon: "Briefcase" },
  { id: "advertisement", name: "Quảng cáo", desc: "Nhấn mạnh thương hiệu xa xỉ", icon: "Award" }
];

export default function ToneConfig({ selectedToneId, onSelectTone }: ToneConfigProps) {
  // Simple icon renderer helper
  const renderIcon = (name: string, isActive: boolean) => {
    const iconClass = `w-3.5 h-3.5 ${isActive ? "text-white" : "text-luxury-500"}`;
    switch (name) {
      case "Coffee": return <Coffee className={iconClass} />;
      case "ShieldCheck": return <ShieldCheck className={iconClass} />;
      case "Laugh": return <Laugh className={iconClass} />;
      case "Smile": return <Smile className={iconClass} />;
      case "Zap": return <Zap className={iconClass} />;
      case "Briefcase": return <Briefcase className={iconClass} />;
      case "Award": return <Award className={iconClass} />;
      default: return <Smile className={iconClass} />;
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-350 mb-2">
        Phong cách thoại / Ngữ điệu
      </label>
      <div className="grid grid-cols-2 gap-2" id="toneGrid">
        {toneOptions.map((tone) => {
          const isActive = tone.id === selectedToneId;
          return (
            <button
              key={tone.id}
              id={`tone-btn-${tone.id}`}
              type="button"
              onClick={() => onSelectTone(tone.id)}
              className={`p-2.5 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer ${
                isActive
                  ? "border-luxury-500 bg-luxury-500 text-white shadow-lg shadow-luxury-500/20"
                  : "border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center space-x-1.5 mb-1">
                {renderIcon(tone.icon, isActive)}
                <span className={`text-xs font-bold whitespace-nowrap ${isActive ? "text-white" : "text-slate-300"}`}>{tone.name}</span>
              </div>
              <p className={`text-[10px] leading-normal line-clamp-1 ${isActive ? "text-white/85" : "text-slate-500"}`}>{tone.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
