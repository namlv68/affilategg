import React from "react";
import { Sparkles } from "lucide-react";
import { AppModule } from "../types";

interface QuickTemplatesProps {
  module: AppModule;
  onSelect: (highlights: string) => void;
}

export default function QuickTemplates({ module, onSelect }: QuickTemplatesProps) {
  const fashionTemplates = [
    {
      id: "silk_dress",
      label: "👗 Váy lụa sang chảnh",
      text: "Đầm lụa tơ tằm nguyên bản màu trắng kem tinh khôi dáng xòe bay bổng. Vải 100% lụa tơ tằm tự nhiên cao cấp, óng ả tinh tế khi xoay dưới nắng, thiết kế thắt nơ lưng duyên dáng che khuyết điểm bụng tối đa, tà váy rủ dài bồng bềnh thướt tha."
    },
    {
      id: "street_blazer",
      label: "🧥 Set Blazer phá cách",
      text: "Áo Blazer oversized dạ tweed màu xám tro dệt sợi kim tuyến lấp lánh tinh xảo. Form dáng đệm vai đứng tôn dáng cá tính thời thượng, khuy bằng đồng đúc tỉ mỉ, rất dễ phối với quần jeans hoặc chân váy dạo phố cực sang."
    },
    {
      id: "ao_dai",
      label: "🌸 Áo Dài cách tân hiện đại",
      text: "Áo dài cách tân tơ hoa hồng thêu tay hoa mai vàng sang quý. Chất tơ ánh ngọc trai mịn óng mát rượi, cổ tròn thoải mái không bí bách, thiết kế tà kép hai lớp dập ly tinh xảo dạo bước nhẹ nhàng bay bổng."
    }
  ];

  const applianceTemplates = [
    {
      id: "air_fryer",
      label: "🍳 Nồi chiên không dầu 6.5L",
      text: "Nồi chiên không dầu điện tử 6.5L lòng nồi phủ ceramic chống dính cao cấp. Mặt trước có kính cường lực trong suốt dễ quan sát thức ăn chín vàng, bảng điều khiển cảm ứng LED 8 chế độ nấu tự động, công nghệ nhiệt đối lưu Rapid Air giảm 85% mỡ thừa, tay cầm cách nhiệt chống bỏng an toàn tuyệt đối."
    },
    {
      id: "mini_vacuum",
      label: "🧹 Máy hút bụi mini cầm tay 12000Pa",
      text: "Máy hút bụi mini cầm tay không dây lực hút cực mạnh 12000Pa động cơ không chổi than 120W. Thiết kế nhỏ gọn chỉ 400g đầm tay, pin sạc Type-C dùng liên tục 35 phút, trang bị đèn LED soi góc tối kèm 3 đầu hút đa năng vệ sinh khe ghế sofa, bàn phím và nội thất ô tô."
    },
    {
      id: "steam_iron",
      label: "👔 Bàn ủi hơi nước gấp gọn 1500W",
      text: "Bàn ủi hơi nước cầm tay gấp gọn công suất lớn 1500W phun sương siêu mịn nhiệt độ cao. Mặt ủi tráng men gốm lướt êm ái là phẳng nếp nhăn sau 15 giây, bình chứa nước 200ml tháo rời tiện lợi, khử khuẩn mùi hôi ẩm mốc trên mọi chất liệu vải lụa len cotton."
    },
    {
      id: "portable_blender",
      label: "🥤 Máy xay sinh tố sạc Type-C",
      text: "Máy xay sinh tố cầm tay mini 6 lưỡi dao inox 304 sắc bén, cối xay thủy tinh borosilicate cao cấp an toàn thực phẩm. Động cơ mạnh mẽ xay đá viên và trái cây nhuyễn mịn trong 30 giây, nắp đậy kèm quai xách thể thao chống tràn, sạc pin tiện lợi mang đi làm đi tập gym."
    },
    {
      id: "smart_thermos",
      label: "☕ Bình giữ nhiệt cảm ứng LED",
      text: "Bình giữ nhiệt thông minh inox 316 cao cấp dung tích 500ml hiển thị nhiệt độ chạm nắp cảm ứng LED. Giữ nóng 12 tiếng và giữ lạnh 24 tiếng, lõi lọc trà inox tiện lợi, thiết kế sơn tĩnh điện nhám mịn sang trọng chống trầy xước."
    }
  ];

  const templates = module === "appliances" ? applianceTemplates : fashionTemplates;

  return (
    <div className="mt-6 pt-6 border-t border-slate-800/60" id="quick-templates">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        {module === "appliances" ? "Điền nhanh mẫu Hàng Gia Dụng Hot:" : "Điền nhanh thông tin mẫu Thời Trang Hot:"}
      </p>
      <div className="flex flex-wrap gap-2">
        {templates.map((tpl) => (
          <button
            key={tpl.id}
            id={`tpl-btn-${tpl.id}`}
            onClick={() => onSelect(tpl.text)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-850 border border-slate-700/60 text-xs text-slate-300 hover:text-white transition-all flex items-center space-x-1 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-luxury-400" />
            <span>{tpl.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

