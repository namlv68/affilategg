import React from "react";
import { ApplianceHoldingStyle, ApplianceContextOption } from "../types";
import { 
  Hand, 
  Armchair, 
  UtensilsCrossed, 
  Box, 
  Laptop, 
  Trees, 
  CheckCircle2, 
  Circle,
  HelpCircle,
  Sparkles
} from "lucide-react";

export interface ApplianceHoldingOption {
  id: ApplianceHoldingStyle;
  name: string;
  desc: string;
  icon: typeof Hand;
  badge: string;
  promptAction: string;
}

export const applianceHoldingOptions: ApplianceHoldingOption[] = [
  {
    id: "hand_hold",
    name: "Cầm sản phẩm trên tay",
    desc: "Cầm sản phẩm trên tay và nói",
    icon: Hand,
    badge: "Phổ biến nhất",
    promptAction: "@NHANVAT cầm sản phẩm @SANPHAM trên tay, thao tác trực tiếp và nói chuyện trước ống kính."
  },
  {
    id: "table_placed",
    name: "Đặt sản phẩm tại bàn",
    desc: "Đặt sản phẩm tại bàn và nói",
    icon: Box,
    badge: "Ổn định & Sang trọng",
    promptAction: "@NHANVAT đặt sản phẩm @SANPHAM ngay ngắn tại bàn, thao tác trực tiếp và nói chuyện trước ống kính."
  }
];

export const applianceContextOptions: ApplianceContextOption[] = [
  {
    id: "kitchen_modern",
    name: "Gian bếp hiện đại cao cấp",
    desc: "Bàn đảo bếp đá cẩm thạch sang trọng, tủ bếp tinh tế, ánh sáng tự nhiên ấm cúng.",
    promptText: "Không gian gian bếp hiện đại sang trọng với bàn đảo bếp đá cẩm thạch cao cấp, tủ bếp tiện nghi, ánh sáng studio kết hợp ánh sáng tự nhiên ấm cúng, chuẩn phong cách smart home hiện đại.",
    icon: "UtensilsCrossed"
  },
  {
    id: "living_room",
    name: "Phòng khách sang trọng",
    desc: "Bàn trà kính cao cấp cạnh sofa nỉ hiện đại, không gian nhà ở thông minh ấm áp.",
    promptText: "Không gian phòng khách hiện đại sang trọng với bàn trà sofa thanh lịch, ánh sáng êm dịu, không khí smart home tiện nghi ấm áp.",
    icon: "Armchair"
  },
  {
    id: "dining_table",
    name: "Bàn ăn gia đình ấm cúng",
    desc: "Bàn ăn gỗ tự nhiên mộc mạc, không khí gia đình sum vầy thân thiện và gần gũi.",
    promptText: "Bàn ăn gia đình gỗ tự nhiên ấm cúng, ánh đèn vàng dịu nhẹ tạo cảm giác sum vầy, gần gũi chân thực.",
    icon: "UtensilsCrossed"
  },
  {
    id: "tech_studio",
    name: "Studio Review Unbox công nghệ",
    desc: "Bàn gỗ chuyên nghiệp, phông nền tối giản, setup ánh sáng 3 điểm sắc nét nổi bật sản phẩm.",
    promptText: "Studio review công nghệ chuyên nghiệp với bàn phẳng tinh tế, ánh sáng 3 điểm sắc nét làm nổi bật từng góc cạnh và chất liệu của sản phẩm, chuẩn reviewer cao cấp.",
    icon: "Box"
  },
  {
    id: "bedroom_desk",
    name: "Bàn làm việc / Phòng ngủ tiện nghi",
    desc: "Góc bàn làm việc/bàn trang điểm gọn gàng, phong cách tối giản thanh lịch.",
    promptText: "Góc bàn làm việc và sinh hoạt gọn gàng, phong cách tối giản thanh lịch, ánh sáng ban ngày trong trẻo.",
    icon: "Laptop"
  },
  {
    id: "balcony_garden",
    name: "Ban công / Sân vườn thoáng đãng",
    desc: "Không gian mở nhiều cây xanh, ánh sáng mặt trời tự nhiên trong lành tươi mát.",
    promptText: "Không gian ban công thoáng đãng nhiều cây xanh ngập tràn ánh sáng ban mai tự nhiên trong lành, phong cách sống xanh tiện lợi.",
    icon: "Trees"
  }
];

interface ApplianceConfigProps {
  holdingStyle: ApplianceHoldingStyle;
  onSelectHoldingStyle: (style: ApplianceHoldingStyle) => void;
  contextId: string;
  onSelectContext: (contextId: string) => void;
}

export default function ApplianceConfig({
  holdingStyle,
  onSelectHoldingStyle,
  contextId,
  onSelectContext
}: ApplianceConfigProps) {
  const getContextIcon = (iconName?: string) => {
    switch (iconName) {
      case "UtensilsCrossed":
        return <UtensilsCrossed className="w-4 h-4 text-amber-400" />;
      case "Armchair":
        return <Armchair className="w-4 h-4 text-sky-400" />;
      case "Box":
        return <Box className="w-4 h-4 text-purple-400" />;
      case "Laptop":
        return <Laptop className="w-4 h-4 text-emerald-400" />;
      case "Trees":
        return <Trees className="w-4 h-4 text-teal-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* THIẾT LẬP 1: PHONG CÁCH CẦM SẢN PHẨM */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
            <span>1. Phong cách cầm sản phẩm</span>
          </label>
          <span className="text-[10px] text-amber-300/80 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full font-medium">
            2 tùy chọn hành động
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="appliance-holding-options">
          {applianceHoldingOptions.map((opt) => {
            const isSelected = holdingStyle === opt.id;
            const Icon = opt.icon;

            return (
              <button
                key={opt.id}
                type="button"
                id={`holding-opt-${opt.id}`}
                onClick={() => onSelectHoldingStyle(opt.id)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? "bg-gradient-to-br from-amber-950/60 via-slate-900 to-amber-900/30 border-amber-500 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/50"
                    : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50 text-slate-300"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-slate-800 text-slate-400"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isSelected ? "text-amber-200" : "text-slate-200"}`}>
                        {opt.name}
                      </h4>
                      <span className="text-[9px] text-slate-400 font-medium">{opt.badge}</span>
                    </div>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  )}
                </div>

                <div className={`text-[11px] p-2 rounded-lg font-medium leading-relaxed mt-1 ${
                  isSelected ? "bg-amber-950/40 text-amber-200/90 border border-amber-800/40" : "bg-slate-900/60 text-slate-400"
                }`}>
                  💬 <span className="font-semibold">{opt.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* THIẾT LẬP 2: BỐI CẢNH QUAY */}
      <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <span>2. Bối cảnh không gian quay</span>
          </label>
          <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full font-medium">
            {applianceContextOptions.length} không gian
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar" id="appliance-context-options">
          {applianceContextOptions.map((ctx) => {
            const isSelected = contextId === ctx.id;

            return (
              <button
                key={ctx.id}
                type="button"
                id={`context-opt-${ctx.id}`}
                onClick={() => onSelectContext(ctx.id)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-2.5 ${
                  isSelected
                    ? "bg-slate-900 border-luxury-500 ring-1 ring-luxury-500/40 shadow-md"
                    : "bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40"
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {getContextIcon(ctx.icon)}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-slate-300"}`}>
                      {ctx.name}
                    </h5>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-luxury-400 flex-shrink-0 ml-1" />}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                    {ctx.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
