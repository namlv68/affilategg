import React, { useState, useEffect } from "react";
import { StyleOption, AppModule } from "../types";
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Eye, 
  Compass, 
  ShoppingBag, 
  Info,
  UtensilsCrossed,
  Armchair,
  FlaskConical,
  Box
} from "lucide-react";

interface StyleConfigProps {
  module: AppModule;
  selectedStyleId: string;
  onSelectStyle: (id: string) => void;
}

export interface GroupedStyleOption extends StyleOption {
  module: AppModule;
  group: string;
  groupLabel: string;
}

export const fashionStyleOptions: GroupedStyleOption[] = [
  // ⚡ NHÓM BẮT TREND & GIẢI TRÍ
  { 
    id: "hot_trend_dance_only", 
    module: "fashion",
    group: "trend",
    groupLabel: "⚡ NHÓM BẮT TREND & GIẢI TRÍ",
    name: "Nhảy theo nhạc trend", 
    desc: "Nhảy theo các giai điệu remix đang thịnh hành cực kỳ viral để hút traffic và tiếp cận tệp khán giả đại chúng.",
    promptText: "Phong cách nhảy theo nhạc trend (Hot Trend Dance). Chuyển động nhảy năng động tự tin lôi cuốn theo nhịp điệu nhạc remix đang viral, gương mặt biểu cảm vui vẻ rạng rỡ thần thái trước camera dập dồn sinh động." 
  },
  { 
    id: "fashion_transition", 
    module: "fashion",
    group: "trend",
    groupLabel: "⚡ NHÓM BẮT TREND & GIẢI TRÍ",
    name: "Biến hình thời trang", 
    desc: "Biến đổi trang phục lột xác ngoạn mục từ giản dị ở nhà sang lộng lẫy kiêu sa ngay tại cú drop beat cực cháy.",
    promptText: "Phong cách biến hình thời trang (Fashion Transformation / Transition). Cú chuyển cảnh mượt mà tinh sảo, đổi từ bộ đồ thường nhật xuề xòa sang đầm váy/blazer cao cấp tôn dáng, trang điểm lộng lẫy thần thái sang chảnh tại thời khắc drop beat cực cháy của nhạc nền." 
  },
  { 
    id: "dance_catwalk_travel", 
    module: "fashion",
    group: "trend",
    groupLabel: "⚡ NHÓM BẮT TREND & GIẢI TRÍ",
    name: "Dance Catwalk qua các thời kỳ", 
    desc: "Cứ sau vài điệu nhảy hoặc nhịp nhạc lại chuyển cảnh mượt mà đổi sang một set thiết kế phong cách khác (Y2K, Cổ phục,...).",
    promptText: "Phong cách Dance Catwalk qua các thời kỳ. Nhân vật đi dạo catwalk tự tin dập dìu, cứ sau 2 giây lại chuyển cảnh mượt mà thay đổi sang một thiết kế mang phong cách khác biệt (Retro, Y2K, Minimalism, Cổ phục) vô cùng sống động bắt mắt." 
  },
  { 
    id: "expectation_reality", 
    module: "fashion",
    group: "trend",
    groupLabel: "⚡ NHÓM BẮT TREND & GIẢI TRÍ",
    name: "Trên mạng vs Thực tế", 
    desc: "So sánh hài hước giữa đồ mặc tôn dáng lung linh trên mạng và thực trạng khôi hài ăn uống dạo phố hằng ngày.",
    promptText: "Phong cách Trên mạng vs Thực tế (Expectation vs Reality). Video chia đôi hoặc so sánh hóm hỉnh: một bên mặc đồ lộng lẫy thần thái cuốn hút, một bên là tình huống hằng ngày khôi khước thực tế gần gũi, ăn uống dạo chơi dở khóc dở cười." 
  },
  { 
    id: "weird_runway", 
    module: "fashion",
    group: "trend",
    groupLabel: "⚡ NHÓM BẮT TREND & GIẢI TRÍ",
    name: "Sàn diễn 'lạ lắm'", 
    desc: "Biến ngõ chợ, bờ ruộng gần gũi thành sàn catwalk quốc tế thần thái siêu mẫu cực 'ngầu' nhưng hành động dí dỏm.",
    promptText: "Phong cách Sàn diễn lạ lắm (Weird Runway Parody). Biến các bối cảnh đời thường như bờ ruộng, lối đi chợ thành sàn diễn thời trang quốc tế, nhân vật sải bước catwalk thần thái quyến rũ siêu mẫu cực ngầu vô cùng hài hước." 
  },
  { 
    id: "biting_review", 
    module: "fashion",
    group: "trend",
    groupLabel: "⚡ NHÓM BẮT TREND & GIẢI TRÍ",
    name: "Review 'Xéo sắc'", 
    desc: "Nhận xét thẳng thắn điểm cộng điểm trừ của phom dáng chất vải bằng giọng điệu dí dỏm, chống tâng bốc một màu.",
    promptText: "Phong cách Review Xéo sắc (Biting Review). Nhân vật chỉ tay thảo luận hăng say cực hóm hỉnh, biểu cảm cơ thể hài hước linh hoạt, review chân thực và chỉ rõ ưu nhược điểm cuốn hút sành điệu." 
  },
  { 
    id: "gta_game_vibe", 
    module: "fashion",
    group: "trend",
    groupLabel: "⚡ NHÓM BẮT TREND & GIẢI TRÍ",
    name: "Giả lập chọn nhân vật game (GTA Vibe)", 
    desc: "Đứng thở lặp lại như nhân vật game, mỗi click chuột tự động thay đổi trang phục kèm thanh trạng thái HP/Mana rực rỡ.",
    promptText: "Phong cách giả lập chọn nhân vật game (GTA Vibe). Nhân vật đứng im thực hiện cử động lặp đi lặp lại nhẹ nhàng tự nhiên như trong trò chơi, khi có click chuột ảo sẽ chuyển động mượt thay đổi trang phục kèm thanh chỉ số HP/Mana phát sáng ấn tượng." 
  },
  { 
    id: "fashion_asmr", 
    module: "fashion",
    group: "trend",
    groupLabel: "⚡ NHÓM BẮT TREND & GIẢI TRÍ",
    name: "Thời trang tiếng vang (Fashion ASMR)", 
    desc: "Không nhạc nền, khuếch đại chân thực tiếng tơ lụa xột xoạt hoắc tiếng kéo khóa khuy kim loại sắc nét mộc mạc.",
    promptText: "Phong cách thời trang tiếng vang (Fashion ASMR). Tập trung thu giữ các âm thanh thực tế cực rõ nét: tiếng xột xoạt của chất liệu lụa satin cao cấp khi chuyển động, tiếng cài cúc kéo khoá chân thực mộc mạc không nhạc nền." 
  },
  { 
    id: "anime_doll_transformation", 
    module: "fashion",
    group: "trend",
    groupLabel: "⚡ NHÓM BẮT TREND & GIẢI TRÍ",
    name: "Biến hình Anime Doll", 
    desc: "Sử dụng filter hoạt hoạ biến thành búp bê anime tranh vẽ từ đó xé khung hình bước ra đời thực cực lạ mắt.",
    promptText: "Phong cách biến hình Anime Doll. Hiệu ứng vẽ tay anime hoặc filter truyện tranh màu sắc biến thành nhân vật 2D, sau đó xé toạc khung hình biến hình bước ra thế giới thực lộng lẫy với trang phục thật." 
  },

  // 🧠 NHÓM TÒ MÒ & THỰC TẾ
  { 
    id: "grwm_hidden", 
    module: "fashion",
    group: "curiosity",
    groupLabel: "🧠 NHÓM TÒ MÒ & THỰC TẾ",
    name: "GRWM giấu đồ", 
    desc: "Get Ready With Me khởi động bằng trang phục đơn giản và giữ kín bộ cánh lụa là tuyệt đẹp đến tận giây cuối.",
    promptText: "Phong cách Get Ready With Me giấu đồ. Khởi điểm với trang phục lót thể thao đơn giản kèm thử thách thú vị, giấu kín thiết kế cao cấp và chỉ hé lộ diện mạo hoàn hảo nhất ở những giây cuối kịch tính." 
  },
  { 
    id: "blind_box_challenge", 
    module: "fashion",
    group: "curiosity",
    groupLabel: "🧠 NHÓM TÒ MÒ & THỰC TẾ",
    name: "Thử thách phối đồ ngẫu nhiên (Blind Box)", 
    desc: "Bốc thăm ngẫu nhiên tổ hợp từ hoá (Xanh lam + Dự tiệc + Cá tính) và tự tay mix đồ tạo kết quả bất ngờ.",
    promptText: "Phong cách phối đồ ngẫu nhiên Blind Box. Nhân vật bốc thăm chọn từ khoá chủ đề ngẫu nhiên vui nhộn, loay hoay lựa chọn và phối hợp tạo nên set đồ cuối cực kỳ sáng tạo dập dâng tính nghệ thuật." 
  },
  { 
    id: "faceless_fashion", 
    module: "fashion",
    group: "curiosity",
    groupLabel: "🧠 NHÓM TÒ MÒ & THỰC TẾ",
    name: "Giấu mặt bí ẩn (Faceless Fashion)", 
    desc: "Góc quay từ cổ trở xuống hoặc che mờ mặt bằng mũ rộng nón râm tạo tổng thể thời thượng, bí hiểm cuốn hút.",
    promptText: "Phong cách giấu mặt bí ẩn (Faceless Fashion). Góc máy điện ảnh quay từ cổ trở xuống hoặc che khéo mặt bằng phụ kiện kính, mũ bóng râm để tập trung hoàn toàn ánh nhìn tôn vinh phom dáng và sự thướt tha của trang phục." 
  },
  { 
    id: "a_day_in_my_life", 
    module: "fashion",
    group: "curiosity",
    groupLabel: "🧠 NHÓM TÒ MÒ & THỰC TẾ",
    name: "Một ngày của tôi (A Day in My Life)", 
    desc: "Vlog sinh hoạt đời thường dạo cà phê, dạo phố năng nổ lồng ghép nhiều bộ cánh để phản ánh hoàn hảo tính ứng dụng.",
    promptText: "Phong cách mộc mạc một ngày của tôi (A Day in My Life Vlog). Góc quay di chuyển tự do chân thực theo các hoạt động thường ngày đi học, đi làm, đi cà phê; thể hiện tính ứng dụng cao và sự thoải mái tối ưu của trang phục." 
  },
  { 
    id: "makeover_rescue", 
    module: "fashion",
    group: "curiosity",
    groupLabel: "🧠 NHÓM TÒ MÒ & THỰC TẾ",
    name: "Biến hình giải cứu (Makeover Challenge)", 
    desc: "Ghi hình lột xác ngoạn mục cho người thân dìm hàng lôi thôi trở lên quý phái, sành điệu qua tài mix đồ.",
    promptText: "Phong cách biến hình giải cứu (Makeover Challenge). Ban đầu dìm dáng khôi hài đồ lôi thôi, sau đó chuyển cảnh lột xác hoàn hảo lộng lẫy cho nhân vật trở thành biểu tượng thời trang rực rỡ." 
  },
  { 
    id: "pov_storytelling", 
    module: "fashion",
    group: "curiosity",
    groupLabel: "🧠 NHÓM TÒ MÒ & THỰC TẾ",
    name: "Tình huống POV", 
    desc: "Đóng vai nhập hoàn cảnh (POV người yêu tổng tài đi giật nợ, POV dạo phố,...), tạo kịch tính giữ chân người xem.",
    promptText: "Phong cách đóng vai tình huống POV (Point of View). Góc máy nhập vai chân thực kể câu chuyện hấp dẫn đời thường, nhân vật tương tác tự nhiên tự tin truyền cảm hứng sành điệu." 
  },
  { 
    id: "street_interview", 
    module: "fashion",
    group: "curiosity",
    groupLabel: "🧠 NHÓM TÒ MÒ & THỰC TẾ",
    name: "Phỏng vấn đường phố (Street Style Interview)", 
    desc: "Bắt chuyện người đi đường ngẫu nhiên đoán giá tủ áo và chấm điểm thần thái trang phục thời trang đang mặc.",
    promptText: "Phong cách phỏng vấn đường phố (Street Style Interview). Khung hình tự nhiên năng động trên vỉa hè sầm uất, nhân vật vui vẻ hỏi han người lạ đoán giá sản phẩm và thảo luận cực sành điệu." 
  },
  { 
    id: "street_request_swap", 
    module: "fashion",
    group: "curiosity",
    groupLabel: "🧠 NHÓM TÒ MÒ & THỰC TẾ",
    name: "Mặc đồ theo yêu cầu người qua đường", 
    desc: "Cầm bảng hiệu dạo phố nhận yêu cầu mix đồ phối ngay tại chỗ tạo sự tương tác bất ngờ, lôi cuốn.",
    promptText: "Phong cách mặc đồ theo yêu cầu người qua đường. Cầm bảng hiệu dễ thương dạo phố, thay đổi trang phục nhanh chóng tương ứng với phong cách được chọn đầy bất ngờ và thú vị tương tác năng động." 
  },
  { 
    id: "extreme_durability_test", 
    module: "fashion",
    group: "curiosity",
    groupLabel: "🧠 NHÓM TÒ MÒ & THỰC TẾ",
    name: "Thử thách độ bền cực đoan (Extreme Testing)", 
    desc: "Vò xé xoa nhăn nheo, kéo dãn hết mức hoắc dội nước trực tiếp để đối chứng chất liệu vải cao cấp đích thực.",
    promptText: "Phong cách thử thách cực đoan (Extreme Testing). Quay cận cảnh thử nghiệm trực tiếp độ co giãn dẻo dai tuyệt vời của sợi lụa, dội nước chống thấm hoặc cuộn tròn ko vết nhăn để khẳng định chất lượng cao cấp mướt mịn dáng đầm váy." 
  },

  // 🎨 NHÓM NGHỆ THUẬT & KIẾN THỨC
  { 
    id: "cinematic_lookbook_style", 
    module: "fashion",
    group: "art",
    groupLabel: "🎨 NHÓM NGHỆ THUẬT & KIẾN THỨC",
    name: "Cinematic Lookbook", 
    desc: "Quay ngoại cảnh vintage chậm rãi slow-motion bay bổng tuyệt mỹ bắt trọn tà váy óng ả bắt sáng tự nhiên.",
    promptText: "Phong cách Cinematic Lookbook. Tận dụng tối đa cú máy quay chậm slow-motion nghệ thuật, bắt lấy từng khoảnh khắc vải bay bổng nhẹ nhàng óng ả bắt ánh hoàng hôn tuyệt đẹp rực rỡ lãng mạn." 
  },
  { 
    id: "stop_motion_flash", 
    module: "fashion",
    group: "art",
    groupLabel: "🎨 NHÓM NGHỆ THUẬT & KIẾN THỨC",
    name: "Stop-Motion/Cắt ghép dồn dập", 
    desc: "Chụp hàng loạt góc ảnh tĩnh lướt nhanh ảo diệu thay đổi xiêm y liên hoàn theo nhịp beatbox dồn dập chất chơi.",
    promptText: "Phong cách Stop-Motion cắt ghép dồn dập. Kết hợp hàng chục góc ảnh tĩnh ghép lại với tần số cực nhanh theo đoạn beat dồn dập, trang phục biến đổi liên tiếp cực kỳ lạ mắt và đậm tính nghệ thuật." 
  },
  { 
    id: "concept_fashion", 
    module: "fashion",
    group: "art",
    groupLabel: "🎨 NHÓM NGHỆ THUẬT & KIẾN THỨC",
    name: "Phối đồ theo Concept", 
    desc: "Lồng ghép câu chuyện điện ảnh hoặc cảm hứng văn hóa truyền thống pha hiện đại với màu phim có chiều sâu sâu sắc.",
    promptText: "Phong cách phối đồ theo Concept nghệ thuật có chiều sâu. Tái hiện phong vị phim điện ảnh cổ điển hoặc lấy cảm hứng từ nét đẹp văn hoá dân gian kết hợp tinh tế cùng phụ kiện hiện đại, màu phim sâu sắc quý phái." 
  },
  { 
    id: "time_travel_decades", 
    module: "fashion",
    group: "art",
    groupLabel: "🎨 NHÓM NGHỆ THUẬT & KIẾN THỨC",
    name: "Dòng thời gian thời trang (Time Travel)", 
    desc: "Quay lại lịch sử thời trang tái hiện phom dáng quý phái sành điệu từ thập niên 1920s, 1970s đến 1990s.",
    promptText: "Phong cách tiến hoá dòng thời gian (Time Travel over decades). Bước đi trên nền nhạc cổ điển, thay đổi phom dáng trang phục lần lượt qua các thập niên nổi tiếng xưa cũ tôn vinh giá trị hoài niệm." 
  },
  { 
    id: "vintage_cassette_vhs", 
    module: "fashion",
    group: "art",
    groupLabel: "🎨 NHÓM NGHỆ THUẬT & KIẾN THỨC",
    name: "Tua băng cassette (VCR/VHS Vibe)", 
    desc: "Màu giả lập nhiễu hạt bụi bặm retro, các vệt xước cổ xưa thích ứng tuyệt mỹ cho denim, denim-on-denim.",
    promptText: "Phong cách VHS Vibe cổ xưa hoài niệm. Sử dụng giả lập nhiễu băng độc đáo, màu phim ngả màu ấm mang vết xước vintage huyền thoại, cực kỳ thích hợp cho các thiết kế streetwear bụi bặm gai góc sành điệu." 
  },
  { 
    id: "fashion_mistakes_repair", 
    module: "fashion",
    group: "art",
    groupLabel: "🎨 NHÓM NGHỆ THUẬT & KIẾN THỨC",
    name: "Sửa lỗi phối đồ dìm dáng (Fashion Mistakes)", 
    desc: "Chỉ ra lỗi mặc xấu dìm chiều cao thường gặp ở nấm lùn và cách phối đồ đúng chuẩn giúp tôn cao thanh thoát quyến rũ.",
    promptText: "Phong cách Sửa lỗi phối đồ (Fashion Mistakes). Khung hình hướng dẫn chỉ rõ 3 lỗi dìm dáng khiến người mặc trông thấp bé, và thực hiện thay thế sửa đổi phối hợp set đồ chuẩn xác giúp hack dáng tăng chiều cao thần kỳ nâng dáng rực rỡ." 
  },
  { 
    id: "capsule_wardrobe_style", 
    module: "fashion",
    group: "art",
    groupLabel: "🎨 NHÓM NGHỆ THUẬT & KIẾN THỨC",
    name: "1 Món đồ - Đa phong cách (Capsule Wardrobe)", 
    desc: "Sử dụng duy nhất 1 món đầm váy dập ly / áo khoác phối ra 5 set đồ đỉnh cao thích ứng đi làm, đi tiệc, đi chơi.",
    promptText: "Phong cách phối đa dạng 1 món đồ (Capsule Wardrobe). Hướng dẫn chi tiết cách mix-match linh hoạt chỉ với một thiết kế chủ đạo tạo nên 5 phong cách sành điệu khác nhau cho nhiều dịp thường nhật tới sang trọng quý phái." 
  },
  { 
    id: "body_shape_styling_tips", 
    module: "fashion",
    group: "art",
    groupLabel: "🎨 NHÓM NGHỆ THUẬT & KIẾN THỨC",
    name: "Bí kíp hack dáng theo Shape người (Body Shape Styling)", 
    desc: "Cách mặc đồ che eo to, giấu mỡ bụng dìm bắp tay cho dáng quả lê, quả táo cực kỳ hữu dụng tuyệt phẩm.",
    promptText: "Phong cách Bí kíp hack dáng theo dáng người (Body Shape Styling). Quay cận cảnh chỉ dẫn phối đồ giấu nhẹm khuyết điểm eo, bắp tay, tôn eo nhỏ tối đa cho dáng người quả lê, quả táo cực kỳ hữu dụng thực với form dáng." 
  },

  // 🛍️ NHÓM QUẢNG CÁO & TRẢI NGHIỆM
  { 
    id: "product_experience", 
    module: "fashion",
    group: "commercial",
    groupLabel: "🛍️ NHÓM QUẢNG CÁO & TRẢI NGHIỆM",
    name: "Trải nghiệm sản phẩm", 
    desc: "Diện thử chân thực trước ống kính, sẻ chia cảm giác mặc thoải mái và phản ánh trực quan phom dáng rủ bồng bềnh thực tế.",
    promptText: "Phong cách Trải nghiệm sản phẩm chân thực. Khung hình cận cảnh sờ thử thớ vải mượt mát, mặc thử phom dáng lên người tôn vinh số đo lý tưởng, và di chuyển trước gương phản chiếu độ rủ thoáng đãng thực tiễn." 
  },
  { 
    id: "product_commercial", 
    module: "fashion",
    group: "commercial",
    groupLabel: "🛍️ NHÓM QUẢNG CÁO & TRẢI NGHIỆM",
    name: "Quảng cáo sản phẩm", 
    desc: "Cận cảnh studio đẳng cấp, hiệu ứng ánh sáng rực rỡ chuẩn chuyên nghiệp, bắt lấy thớ vải tinh xảo như TVC nhãn lớn.",
    promptText: "Phong cách quảng cáo sản phẩm thời trang chuyên nghiệp (TVC lookbook). Sử dụng các góc máy chuyên nghiệp, lia cận cảnh thớ vải bắt ánh sáng lấp lánh rực rỡ, phối hợp nhạc điệu quý phái tạo dựng hình ảnh thương phẩm high-end." 
  },
  { 
    id: "problem_solution", 
    module: "fashion",
    group: "commercial",
    groupLabel: "🛍️ NHÓM QUẢNG CÁO & TRẢI NGHIỆM",
    name: "Vấn đề và Giải pháp", 
    desc: "Mở đầu kịch tính với phiền phức dìm dáng (váy lộ eo to, tà nhăn nhúm) và đưa ra gợi ý giải pháp từ đầm lụa sang trọng.",
    promptText: "Phong cách kịch bản Vấn đề và Giải pháp thiết thực. Nêu bật nỗi lo sợ thường nhật của phái đẹp (bắp tay thô, bụng dưới dễ lộ khi mặc ôm), kế tiếp biến hình lộng lẫy đưa ra giải pháp đột phá với đầm lụa che khuyết điểm thần sầu." 
  },
  { 
    id: "fabric_focus", 
    module: "fashion",
    group: "commercial",
    groupLabel: "🛍️ NHÓM QUẢNG CÁO & TRẢI NGHIỆM",
    name: "Cận cảnh chất liệu (Fabric Focus)", 
    desc: "Zoom siêu góc cận nhãn quan vào sớ sợi, nếp dập sọc dập ly tinh tế và bàn tay dạo nhẹ trên viền chỉ thêu tỉ mỉ.",
    promptText: "Phong cách cận cảnh chất liệu cao cấp (Fabric Detail Focus). Camera đặt góc macro siêu nét bắt trọn các thớ tơ lụa mịn màng không vết nhăn, zoom sát từng chi tiết khoá kéo, khuy áo mạ sang trọng để tối đa uy tín chất lượng." 
  }
];

export const applianceStyleOptions: GroupedStyleOption[] = [
  // 🍳 NHÓM BẾP & BÀN ĂN
  {
    id: "appliance_kitchen_hands_on",
    module: "appliances",
    group: "kitchen",
    groupLabel: "🍳 NHÓM BẾP & BÀN ĂN",
    name: "Bếp Hiện Đại - Cầm Thao Tác & Nấu Thực Tế",
    desc: "@NHANVAT cầm sản phẩm trên tay tại quầy bếp đá sang trọng, vừa bấm nút thao tác vừa tươi cười review độ tiện lợi.",
    promptText: "Phong cách Bếp Hiện Đại Cầm Trên Tay (Modern Kitchen Hands-on). @NHANVAT đứng bên bàn đảo bếp đá cẩm thạch sang trọng tiện nghi, hai tay cầm chắc @SANPHAM ngang tầm ngực, tươi cười thao tác bấm nút mở nắp và hướng góc nhìn sản phẩm về phía máy quay, ánh sáng studio ấm cúng tự nhiên."
  },
  {
    id: "appliance_quick_breakfast",
    module: "appliances",
    group: "kitchen",
    groupLabel: "🍳 NHÓM BẾP & BÀN ĂN",
    name: "Bữa Sáng Nhanh Gọn 3 Phút (Fast Routine)",
    desc: "Cầm máy xay/bình giữ nhiệt/lò nướng trên tay làm nhanh bữa sáng đủ chất, thao tác một chạm siêu tiện.",
    promptText: "Phong cách Bữa Sáng Nhanh Gọn (Fast Breakfast Hands-on). @NHANVAT cầm @SANPHAM trên tay biểu diễn thao tác một chạm chuẩn bị bữa sáng thần tốc, ánh sáng bình minh ấm áp tràn qua cửa sổ bếp, thần thái tràn đầy năng lượng tích cực."
  },

  // 🛋️ NHÓM PHÒNG KHÁCH & NHÀ CỬA
  {
    id: "appliance_living_smart",
    module: "appliances",
    group: "living",
    groupLabel: "🛋️ NHÓM PHÒNG KHÁCH & NHÀ CỬA",
    name: "Phòng Khách Sang Trọng - Cầm Review 360°",
    desc: "Ngồi sofa bọc nỉ cao cấp, cầm sản phẩm trên tay xoay các góc, chỉ vào màn hình hiển thị và nút điều khiển thông minh.",
    promptText: "Phong cách Phòng Khách Sang Trọng (Living Room Hands-on Review). @NHANVAT ngồi thư thái trên sofa phòng khách hiện đại tinh tế, hai tay cầm @SANPHAM xoay nhẹ nhàng 360 độ trước ống kính, dùng ngón tay chỉ vào các phím bấm và tính năng thông minh."
  },
  {
    id: "appliance_problem_solution",
    module: "appliances",
    group: "living",
    groupLabel: "🛋️ NHÓM PHÒNG KHÁCH & NHÀ CỬA",
    name: "Giải Cứu Việc Nhà Bận Rộn (Problem & Solution)",
    desc: "Khởi đầu với sự bất tiện/mất thời gian khi dọn dẹp, sau đó @NHANVAT cầm thiết bị trên tay xử lý êm ru trong tích tắc.",
    promptText: "Phong cách Giải Cứu Việc Nhà (Problem & Smart Appliance Solution). Mở đầu với tình huống bất tiện bận rộn hằng ngày, sau đó @NHANVAT cầm @SANPHAM trên tay mỉm cười tự tin, trực tiếp thao tác giải quyết nhẹ nhàng và hiệu quả vượt trội."
  },

  // 🔬 NHÓM TEST MÁY & HIỆU NĂNG
  {
    id: "appliance_extreme_test",
    module: "appliances",
    group: "testing",
    groupLabel: "🔬 NHÓM TEST MÁY & HIỆU NĂNG",
    name: "Thử Thách Hiệu Năng Thực Tế (Live Extreme Test)",
    desc: "Cầm máy trên tay test trực tiếp lực hút, độ chống ồn, độ mịn mượt hoặc nhiệt độ ngay trước camera cực kỳ thuyết phục.",
    promptText: "Phong cách Thử Thách Hiệu Năng Thực Tế (Extreme Live Performance Test). @NHANVAT cầm @SANPHAM trên tay thực hiện bài test công năng trực diện (lực hút/độ êm/tốc độ gia nhiệt), biểu cảm ngạc nhiên chân thực chứng minh chất lượng vượt trội."
  },
  {
    id: "appliance_asmr_tactile",
    module: "appliances",
    group: "testing",
    groupLabel: "🔬 NHÓM TEST MÁY & HIỆU NĂNG",
    name: "Gia Dụng ASMR - Thao Tác Cầm Bấm Siêu Nét",
    desc: "Khuếch đại tiếng bấm công tắc cơ 'tách', tiếng mô tơ êm ru, tiếng khớp khóa chắc nịch không tạp âm.",
    promptText: "Phong cách Gia Dụng ASMR (Tactile Sound ASMR). Camera bắt cận cảnh đôi bàn tay @NHANVAT cầm nắm và bấm các phím bấm của @SANPHAM, thu giữ âm thanh chân thực rõ nét: tiếng nhấn nút, tiếng khớp nối vào vị trí, tiếng máy vận hành êm ru."
  },

  // 📦 NHÓM STUDIO & UNBOX CẬN CẢNH
  {
    id: "appliance_unbox_first_look",
    module: "appliances",
    group: "studio",
    groupLabel: "📦 NHÓM STUDIO & UNBOX CẬN CẢNH",
    name: "Đập Hộp & Trải Nghiệm Đầu Tiên (Unboxing Look)",
    desc: "Mở hộp gỗ/studio, cầm từng phụ kiện và thân máy chính trên tay khoe lớp sơn hoàn thiện cao cấp sắc sảo.",
    promptText: "Phong cách Đập Hộp Unboxing Cận Cảnh (Unboxing First Look). Đặt tại bàn gỗ studio ánh sáng 3 điểm sắc nét, @NHANVAT cầm thân máy @SANPHAM và từng phụ kiện trên tay khoe vẻ đẹp thiết kế nguyên khối và độ đầm tay chất lượng."
  },
  {
    id: "appliance_macro_details",
    module: "appliances",
    group: "studio",
    groupLabel: "📦 NHÓM STUDIO & UNBOX CẬN CẢNH",
    name: "Cận Cảnh Chi Tiết Kỹ Thuật (Macro Details)",
    desc: "Zoom siêu cận cảnh vào bàn tay cầm sản phẩm, màn hình cảm ứng LED sắc nét, độ nhạy phím và chất liệu chống xước.",
    promptText: "Phong cách Cận Cảnh Chi Tiết Gia Dụng (Macro Hands-on Detail). Camera zoom macro siêu nét vào chi tiết @SANPHAM trên tay @NHANVAT: mặt kính chịu nhiệt, phím bấm cảm ứng nhạy bén, khe tản nhiệt và chất liệu hoàn thiện chống bám vân tay."
  }
];

export const styleOptions: GroupedStyleOption[] = [
  ...fashionStyleOptions,
  ...applianceStyleOptions
];

export default function StyleConfig({ module, selectedStyleId, onSelectStyle }: StyleConfigProps) {
  // Available groups based on module
  const fashionGroups = [
    { key: "trend", label: "⚡ Trend & Giải Trí", icon: Flame },
    { key: "curiosity", label: "🧠 Tò Mò & Thực Tế", icon: Eye },
    { key: "art", label: "🎨 Nghệ Thuật & Kiến Thức", icon: Compass },
    { key: "commercial", label: "🛍️ Quảng Cáo & Trải Nghiệm", icon: ShoppingBag }
  ] as const;

  const applianceGroups = [
    { key: "kitchen", label: "🍳 Bếp & Bàn Ăn", icon: UtensilsCrossed },
    { key: "living", label: "🛋️ Phòng Khách & Nhà Cửa", icon: Armchair },
    { key: "testing", label: "🔬 Test Máy & Hiệu Năng", icon: FlaskConical },
    { key: "studio", label: "📦 Studio & Unbox", icon: Box }
  ] as const;

  const currentStyles = module === "appliances" ? applianceStyleOptions : fashionStyleOptions;
  const currentGroups = module === "appliances" ? applianceGroups : fashionGroups;

  // Find the group of the currently selected style
  const matchedStyle = currentStyles.find((s) => s.id === selectedStyleId) || currentStyles[0];
  const defaultGroupKey = matchedStyle ? matchedStyle.group : currentGroups[0].key;

  // Active group state handles which tab is selected
  const [activeGroup, setActiveGroup] = useState<string>(defaultGroupKey);

  // Sync state if selectedStyleId or module changes from the outside
  useEffect(() => {
    const matched = currentStyles.find((s) => s.id === selectedStyleId);
    if (matched) {
      setActiveGroup(matched.group);
    } else if (currentStyles.length > 0) {
      // Auto select first style if current selection doesn't match the active module
      onSelectStyle(currentStyles[0].id);
      setActiveGroup(currentStyles[0].group);
    }
  }, [selectedStyleId, module]);

  const filteredStyles = currentStyles.filter((s) => s.group === activeGroup);

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-350">
          {module === "appliances" ? "Bối cảnh & Phong cách Cầm trên tay" : "Phong cách quay video & Bối cảnh"}
        </label>
        <span className="text-[10px] text-slate-500 flex items-center space-x-1 font-medium bg-slate-900 border border-slate-800/80 px-2 py-0.5 rounded-full">
          <Info className="w-3 h-3 text-luxury-500" />
          <span>{module === "appliances" ? "Gia dụng trực quan" : "Đã chia nhóm tối ưu"}</span>
        </span>
      </div>

      {/* COMPACT GROUP TABS */}
      <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
        {currentGroups.map((grp) => {
          const isActive = activeGroup === grp.key;
          const IconComponent = grp.icon;
          return (
            <button
              key={grp.key}
              type="button"
              onClick={() => setActiveGroup(grp.key)}
              className={`flex items-center justify-center space-x-1.5 py-2 px-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all ${
                isActive
                  ? "bg-luxury-500 text-white border border-luxury-500 shadow-md shadow-luxury-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent"
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-luxury-500"}`} />
              <span className="truncate">{grp.label}</span>
            </button>
          );
        })}
      </div>

      {/* FILTERED STYLE CARD LIST - SCROLLABLE MAX-HEIGHT CONTAINER TO REDUCE ACCORDION HEIGHT */}
      <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1 select-none custom-scrollbar-thin">
        {filteredStyles.map((style) => {
          const isActive = style.id === selectedStyleId;
          return (
            <div
              key={style.id}
              id={`style-card-${style.id}`}
              onClick={() => onSelectStyle(style.id)}
              className={`p-2.5 rounded-xl border flex items-start space-x-2.5 cursor-pointer transition-all duration-150 active:scale-[0.99] ${
                isActive
                  ? "border-luxury-500 bg-luxury-500 text-white shadow-lg shadow-luxury-500/25"
                  : "border-slate-800/70 bg-slate-900/30 hover:border-slate-700/80 hover:bg-slate-900/50"
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isActive ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-400 transition-colors" />
                )}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-[11px] font-bold leading-snug truncate ${isActive ? "text-white" : "text-slate-200"}`}>
                    {style.name}
                  </h4>
                </div>
                <p className={`text-[10px] mt-0.5 leading-relaxed line-clamp-2 ${isActive ? "text-white/85" : "text-slate-400"}`}>
                  {style.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

