import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Create application instance
const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Dynamic initializer helper for Google GenAI client
function getGenAI(customApiKey?: string): GoogleGenAI {
  const apiKey = (customApiKey && typeof customApiKey === "string" ? customApiKey.trim() : "") || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Chưa có API KEY. Vui lòng dán Gemini API KEY của bạn vào mục 'Cấu hình API KEY' để kích hoạt tác vụ AI.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Resilient wrapper to invoke Gemini API with automatic retries and model fallback
async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: any,
  modelsToTry: string[]
) {
  let lastError: any = null;

  for (const model of modelsToTry) {
    // Try up to 2 attempts per model to avoid timing out the client connection
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Gemini API] Requesting ${model} - Attempt ${attempt}/2...`);
        const response = await ai.models.generateContent({
          ...params,
          model: model,
        });
        return response;
      } catch (error: any) {
        lastError = error;
        const errMsg = error?.message || String(error);
        const errCode = error?.status || error?.code || 500;

        console.warn(`[Gemini API] Attempt ${attempt}/2 for model ${model} failed. Error:`, errMsg);

        // Fail fast on non-retryable user input errors (e.g., 400 Bad Request, invalid key)
        if (
          errCode === 400 || 
          errMsg.includes("400") || 
          errMsg.includes("INVALID_ARGUMENT") || 
          errMsg.includes("API key not valid") || 
          errMsg.includes("API_KEY_INVALID")
        ) {
          throw error;
        }

        // If Quota exhausted (429) or high demand (503), switch immediately to next fallback model
        if (errCode === 429 || errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errCode === 503) {
          console.warn(`[Gemini API] Rate limit or high demand on ${model}, quickly switching to fallback model...`);
          break;
        }

        // Short exponential delay before retrying same model
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
    }
  }

  throw lastError || new Error(`Tất cả mô hình AI (${modelsToTry.join(", ")}) đều không khả dụng. Vui lòng thử lại sau.`);
}

// Quy tắc tránh các từ cấm/bóp tương tác trên các nền tảng video ngắn (TikTok, Reels, Shorts...)
const PLATFORM_COMPLIANCE_GUIDELINES = `
QUY TẮC BẮT BUỘC VỀ TỪ NGỮ NÓI GIẢM NÓI TRÁNH TRONG LỜI THOẠI NHÂN VẬT:
Trong toàn bộ lời thoại nhân vật (trong timeline cũng như trong prompt_text), TUYỆT ĐỐI KHÔNG dùng các từ ngữ cấm hoặc nhạy cảm của các nền tảng video ngắn. BẮT BUỘC sử dụng các từ thay thế nói giảm nói tránh sau đây:

1. Điều hướng & Nền tảng khác:
- Thay vì "Shopee" -> Dùng: "Sàn cam", "S pi", hoặc "Sho.pe"
- Thay vì "Lazada" -> Dùng: "Sàn xanh dương", hoặc "Laza"
- Thay vì "Facebook" -> Dùng: "Phở bò", "F b", hoặc "Phây"
- Thay vì "Instagram" -> Dùng: "In sờ ta", "IG", hoặc "Bức ảnh"
- Thay vì "Zalo" -> Dùng: "Dép lào", "Za lố", hoặc "Z.L"
- Thay vì "YouTube" -> Dùng: "Du túp", "Du tu be", hoặc "Nền tảng đỏ"
- Thay vì "Số điện thoại", "Hotline" -> Dùng: "Số cầm tay", "S.đ.t", hoặc "Chấm mút liên hệ"
- Thay vì "Chuyển khoản", "Bắn tiền" -> Dùng: "Chuyển phở", "Tinh tinh", hoặc "Bắn lộc"
- Thay vì "Link bio", "Website ngoài" -> Dùng: "Đầu trang", "Tiểu sử", hoặc "Góc trái màn hình"

2. Giao dịch & Giá cả:
- Thay vì "Tiền", "Đồng", "VNĐ" -> Dùng: "Cành", "K", "Bắp", "Xu", "Điểm"
- Thay vì "Mua ngay", "Đặt hàng" -> Dùng: "Rước về", "Bấm góc trái", "Thêm vào giỏ", "Hốt về"
- Thay vì "Rẻ nhất", "Giá sàn" -> Dùng: "Mức giá cực mềm", "Hạt dẻ", "Êm ví", "Tối ưu chi phí"
- Thay vì "Sale", "Giảm giá" -> Dùng: "Chạm đáy", "Sập giá", "Tụt dốc", "Đỏ sàn"
- Thay vì "Miễn phí", "Free" -> Dùng: "0đ", "Tặng kèm trải nghiệm", "Tri ân", "Phờ di"
- Thay vì "Hàng fake", "Hàng nhái" -> Dùng: "Bản rep", "Rep 1:1", "Hàng tuồn", "Giống hãng"

3. Cam kết & Tuyệt đối hóa:
- Thay vì "Cam kết 100%", "Chắc chắn" -> Dùng: "Yên tâm trải nghiệm", "Nhiều người phản hồi tốt"
- Thay vì "Số 1", "Tốt nhất", "Hoàn hảo" -> Dùng: "Chân ái", "Đỉnh chóp", "Cực kỳ ổn áp", "Đáng tiền"
- Thay vì "Dứt điểm", "Khỏi hẳn", "Vĩnh viễn" -> Dùng: "Bền vững", "Lâu dài", "Hỗ trợ duy trì ổn định"
- Thay vì "An toàn tuyệt đối" -> Dùng: "Thành phần lành tính", "Dịu nhẹ cho cơ thể"
- Thay vì "Cấp tốc", "Hiệu quả tức thì" -> Dùng: "Nhanh chóng thấy đổi khác", "Cảm nhận sớm"

4. Sức khỏe & Thực phẩm chức năng:
- Thay vì "Thuốc", "Dược liệu" -> Dùng: "Viên uống", "Dưỡng chất bổ sung", "Dòng hỗ trợ", "Giải pháp"
- Thay vì "Điều trị", "Chữa bệnh", "Đặc trị" -> Dùng: "Hỗ trợ cải thiện", "Làm dịu", "Chăm sóc", "Phục hồi"
- Thay vì "Giảm cân", "Tan mỡ", "Hút mỡ" -> Dùng: "Về dáng", "Siết cơ", "Giữ dáng", "Nhẹ người", "Thon gọn"
- Thay vì "Tăng cân" -> Dùng: "Nâng cao thể trạng", "Đầy đặn hơn", "Bổ sung dinh dưỡng"
- Thay vì "Thải độc", "Tống độc tố" -> Dùng: "Thanh lọc cơ thể", "Làm sạch cặn bã", "Nhẹ bụng"
- Thay vì "Viêm nhiễm", "Kháng viêm" -> Dùng: "Kích ứng bề mặt", "Vùng nhạy cảm", "Tình trạng khó chịu"
- Thay vì "Bệnh nhân", "Bác sĩ" -> Dùng: "Người gặp vấn đề thể trạng", "Chuyên gia đầu ngành"

5. Mỹ phẩm & Làm đẹp:
- Thay vì "Trắng da cấp tốc", "Bật tone" -> Dùng: "Nâng tone", "Sáng da", "Đều màu", "Rạng rỡ hơn"
- Thay vì "Trị mụn", "Trị nám triệt để" -> Dùng: "Làm dịu nốt mụn", "Mờ đốm nâu", "Xử lý khuyết điểm"
- Thay vì "Tẩy trắng", "Lột da" -> Dùng: "Làm sạch sâu", "Tái tạo bề mặt nhẹ nhàng"
- Thay vì "Xóa nhăn hoàn toàn", "Trẻ hóa ngay" -> Dùng: "Hỗ trợ tăng đàn hồi", "Giảm dấu hiệu thời gian"
`;

// Helper sanitize string in dialogues
function sanitizePlatformEuphemisms(text: string): string {
  if (!text) return text;
  let s = text;
  const replacements: [RegExp, string][] = [
    // Điều hướng & Nền tảng khác
    [/\bshopee\b/gi, "Sàn cam"],
    [/\blazada\b/gi, "Sàn xanh dương"],
    [/\bfacebook\b/gi, "Phở bò"],
    [/\binstagram\b/gi, "In sờ ta"],
    [/\bzalo\b/gi, "Dép lào"],
    [/\byoutube\b/gi, "Du túp"],
    [/\b(số điện thoại|hotline)\b/gi, "Số cầm tay"],
    [/\b(chuyển khoản|bắn tiền)\b/gi, "Tinh tinh"],
    [/\b(link bio|website ngoài)\b/gi, "Góc trái màn hình"],

    // Giao dịch & Giá cả
    [/\b(mua ngay|đặt hàng)\b/gi, "Rước về"],
    [/\b(rẻ nhất|giá sàn)\b/gi, "Hạt dẻ"],
    [/\b(giảm giá|sale off)\b/gi, "Sập giá"],
    [/\b(miễn phí|free ship|free)\b/gi, "0đ"],
    [/\b(hàng fake|hàng nhái)\b/gi, "Bản rep 1:1"],

    // Cam kết & Tuyệt đối hóa
    [/\b(cam kết 100%|cam kết)\b/gi, "Yên tâm trải nghiệm"],
    [/\b(số 1|tốt nhất|hoàn hảo)\b/gi, "Chân ái"],
    [/\b(dứt điểm|khỏi hẳn|vĩnh viễn)\b/gi, "Bền vững lâu dài"],
    [/\ban toàn tuyệt đối\b/gi, "Thành phần lành tính dịu nhẹ"],
    [/\b(cấp tốc|hiệu quả tức thì)\b/gi, "Nhanh chóng thấy đổi khác"],

    // Sức khỏe & Thực phẩm chức năng
    [/\b(thuốc trị|thuốc chữa|dược liệu)\b/gi, "Dưỡng chất hỗ trợ"],
    [/\b(điều trị|chữa bệnh|đặc trị)\b/gi, "Hỗ trợ cải thiện"],
    [/\b(giảm cân|tan mỡ|hút mỡ)\b/gi, "Về dáng"],
    [/\btăng cân\b/gi, "Đầy đặn hơn"],
    [/\b(thải độc|tống độc tố)\b/gi, "Thanh lọc cơ thể"],
    [/\b(viêm nhiễm|kháng viêm)\b/gi, "Kích ứng bề mặt"],
    [/\b(bệnh nhân)\b/gi, "Người gặp vấn đề thể trạng"],

    // Mỹ phẩm & Làm đẹp
    [/\b(trắng da cấp tốc|bật tone)\b/gi, "Nâng tone sáng da"],
    [/\b(trị mụn|trị nám triệt để)\b/gi, "Làm dịu nốt mụn, mờ khuyết điểm"],
    [/\b(tẩy trắng|lột da)\b/gi, "Làm sạch sâu"],
    [/\b(xóa nhăn hoàn toàn|trẻ hóa ngay)\b/gi, "Hỗ trợ tăng đàn hồi"]
  ];

  for (const [regex, replacement] of replacements) {
    s = s.replace(regex, replacement);
  }
  return s;
}

// Clean dialogue specifically (ensures @SANPHAM and @NHANVAT never leak into spoken dialogue)
function cleanDialogueText(text: string): string {
  if (!text) return text;
  let s = sanitizePlatformEuphemisms(text);
  // Replace any accidental @SANPHAM or @NHANVAT tags in spoken dialogue with natural terms
  s = s.replace(/@SANPHAM\b/gi, "em này");
  s = s.replace(/@NHANVAT\b/gi, "mình");
  return s;
}
app.post("/api/translate", async (req, res) => {
  try {
    const { text, customApiKey } = req.body;
    if (!text) {
      res.status(400).json({ error: "Nội dung cần dịch là bắt buộc" });
      return;
    }
    const apiKey = customApiKey || (req.headers["x-custom-api-key"] as string);
    const ai = getGenAI(apiKey);

    const response = await generateContentWithRetry(
      ai,
      {
        contents: `Hãy dịch đoạn Prompt thời trang tiếng Việt sau đây sang Tiếng Anh chuyên nghiệp tối ưu để sinh video AI (như Luma, Kling, Runway Gen-3). 
Yêu cầu:
- Tuyệt đối chỉ trả về bản dịch tiếng Anh duy nhất, không thêm bớt lời dẫn hay bất kỳ ký tự giải thích nào khác.
- Giữ nguyên các tag đặc biệt như @NHANVAT, @SANPHAM và không dịch các nhãn tag này.
- Giữ nguyên cấu trúc dòng và phân đoạn y hệt đoạn gốc.

Đoạn cần dịch:
${text}`,
        config: {
          temperature: 0.1,
        }
      },
      ["gemini-2.5-flash", "gemini-3.1-flash-lite"]
    );

    const translatedText = response.text?.trim() || "";
    res.json({ translatedText });
  } catch (err: any) {
    console.error("Translation error:", err);
    let errMsg = err?.message || "Lỗi dịch tiếng Anh";
    try {
      if (typeof errMsg === "string" && errMsg.trim().startsWith("{")) {
        const parsed = JSON.parse(errMsg);
        if (parsed?.error?.message) errMsg = parsed.error.message;
      }
    } catch {}
    res.status(500).json({ error: errMsg });
  }
});

// REST route to generate kịch bản và prompt AI
app.post("/api/generate", async (req, res) => {
  try {
    const { 
      module = "fashion", 
      highlights, 
      duration, 
      tone, 
      style, 
      stylePrompt, 
      selectedStyleId,
      holdingStyle = "hand_hold",
      cta, 
      customApiKey 
    } = req.body;

    if (!highlights) {
      res.status(400).json({ error: "Thông tin và điểm nổi bật của sản phẩm là bắt buộc." });
      return;
    }

    const isAppliance = module === "appliances";
    const isTablePlaced = isAppliance && holdingStyle === "table_placed";
    const apiKey = customApiKey || (req.headers["x-custom-api-key"] as string);
    const ai = getGenAI(apiKey);

    const expectedSegmentsCount = Math.max(1, Math.round(duration / 10));

    const applianceActionCore = isTablePlaced
      ? `"ĐẶT SẢN PHẨM @SANPHAM TẠI BÀN VÀ NÓI" (@SANPHAM được đặt ngay ngắn trên bàn/mặt bàn bối cảnh, @NHANVAT đứng hoặc ngồi cạnh bàn, hướng ánh nhìn về camera, dùng tay chỉ vào @SANPHAM, một tay chạm vào phím bấm/mở nắp/thao tác trực tiếp trên mặt bàn và nói chuyện tương tác tự nhiên trước ống kính)`
      : `"CẦM SẢN PHẨM @SANPHAM TRÊN TAY VÀ NÓI" (hai tay cầm chắc @SANPHAM ngang tầm ngực hoặc xoay các góc trước camera, thao tác bấm phím/mở nắp/cầm xoay 360 độ/demo tính năng trực tiếp trên tay và hướng về phía ống kính máy quay, biểu cảm chân thực và nói chuyện tương tác gần gũi với khán giả)`;

    const isTransformationStyle = !isAppliance && (
      selectedStyleId?.includes("transition") ||
      selectedStyleId?.includes("transform") ||
      selectedStyleId?.includes("makeover") ||
      selectedStyleId?.includes("expectation") ||
      selectedStyleId?.includes("time_travel") ||
      selectedStyleId?.includes("stop_motion") ||
      selectedStyleId?.includes("mistakes") ||
      selectedStyleId?.includes("capsule") ||
      selectedStyleId?.includes("swap") ||
      selectedStyleId?.includes("gta") ||
      selectedStyleId?.includes("dance_catwalk") ||
      (typeof style === "string" && (style.toLowerCase().includes("biến hình") || style.toLowerCase().includes("lột xác") || style.toLowerCase().includes("đổi trang phục") || style.toLowerCase().includes("transition")))
    );

    const systemInstruction = isAppliance
      ? `Bạn là một chuyên gia biên kịch và thiết kế Prompt AI video HÀNG GIA DỤNG, THIẾT BỊ THÔNG MINH VÀ ĐỒ DÙNG TIỆN ÍCH GIA ĐÌNH hàng đầu. Nhiệm vụ của bạn là nhận thông tin sản phẩm gia dụng và nhân vật để sinh ra một cấu trúc JSON kịch bản phân đoạn và DANH SÁCH CÁC PROMPT riêng lẻ (mỗi prompt dài đúng 10s, tương ứng với số phân cảnh cần thiết để đạt tổng thời lượng yêu cầu).
Dựa trên thông tin sản phẩm do người dùng cung cấp, bạn hãy đặt một tên gọi ngắn gọn, chuẩn xác cho món đồ gia dụng đó, đại diện làm tag @SANPHAM để dùng thống nhất trong toàn bộ kịch bản và prompt.
HÃY TRẢ VỀ DỮ LIỆU ĐỊNH DẠNG JSON KHÔNG ĐƯỢC CHỨA BẤT KỲ ĐOẠN DẪN NÀO NGOÀI JSON SẠCH MÔ TẢ ĐÚNG THEO KHUÔN MẪU.

QUY TẮC CỐT LÕI VỀ HÀNH ĐỘNG NHÂN VẬT TRONG MODULE HÀNG GIA DỤNG:
- PHONG CÁCH TƯƠNG TÁC ĐƯỢC CHỌN: ${applianceActionCore}.
- Trong mọi phân đoạn timeline 3s và các mốc 10s: @NHANVAT luôn thực hiện đúng hành động đã chọn (${isTablePlaced ? "Đặt sản phẩm tại bàn và nói, thao tác trên bàn" : "Cầm sản phẩm trên tay và nói, thao tác trên tay"}).

QUY TẮC BẮT BUỘC VỀ ĐỘ DÀI LỜI THOẠI TRONG 10 GIÂY:
- Tổng số từ của lời thoại nhân vật trong mỗi clip 10 giây (hoặc tổng 3 mốc 0s-3s, 3s-6s, 6s-10s cộng lại) BẮT BUỘC PHẢI ĐẠT KHOẢNG 37 ĐẾN 42 TỪ.
- Tốc độ nói phù hợp chuẩn video ngắn (khoảng 3.7 - 4.2 từ/giây), câu từ súc tích, nhịp điệu cuốn hút, giàu cảm xúc, đầy đủ thông tin đắt giá.

Chú ý cấu trúc prompt & kịch bản:
1. Trong "prompt_text" của danh sách "prompts", tuyệt đối KHÔNG chứa khối thông tin mô tả rườm rà về nhân vật như "Nhân vật: Reviewer gia dụng...".
2. Các khối thông số trong "prompt_text" (ví dụ: mở đầu tương tác sản phẩm, bối cảnh, HÀNH ĐỘNG:, yêu cầu thoại, yêu cầu hình ảnh) bắt buộc phải được ngăn cách rõ ràng bằng các dòng trống xuống dòng riêng biệt (phân tách dòng).
3. Mỗi phân cảnh video 10 giây bên trong "prompts" phải có phần "HÀNH ĐỘNG:" chia nhỏ chi tiết thành đúng 3 mốc thời gian: "0s - 3s", "3s - 6s" và "6s - 10s", trong đó @NHANVAT luôn ${isTablePlaced ? "tương tác với @SANPHAM đặt trên bàn và nói/thao tác" : "cầm @SANPHAM trên tay và nói/thao tác"}. Tổng lời thoại trong 3 mốc của mỗi prompt 10s phải đạt từ 37 đến 42 từ.
4. Cực kỳ quan trọng về liền mạch logic chuyển tiếp: Vì AI sinh từng video độc lập không biết được phân cảnh trước đó là gì, bạn bắt buộc phải thiết lập logic nối tiếp: cảnh đầu (mốc 0s - 3s) của prompt thứ hai trở đi phải tiếp tục trùng khớp và bắt đầu dựa theo trạng thái, tư thế ${isTablePlaced ? "đứng/ngồi cạnh bàn và thao tác" : "cầm trên tay/thao tác"} của cảnh cuối (mốc 6s - 10s) thuộc prompt liền trước để giữ tính liên tục hoàn hảo.
5. Trong mọi mô tả hành động hay vị trí bên trong "prompt_text" của danh mục "prompts", TUYỆT ĐỐI KHÔNG dùng từ "nhân vật" hay "reviewer" hay "creator". Mọi vị trí đó BẮT BUỘC phải viết là "@NHANVAT" (Ví dụ: "${isTablePlaced ? "@NHANVAT đứng cạnh bàn chỉ tay vào @SANPHAM mỉm cười" : "@NHANVAT cầm @SANPHAM trên tay mỉm cười"}", "@NHANVAT bấm nút điều khiển trên @SANPHAM").
6. QUY TẮC CỰC KỲ QUAN TRỌNG VỀ LỜI THOẠI NHÂN VẬT VÀ TÊN SẢN PHẨM:
   - Trong TOÀN BỘ LỜI THOẠI NHÂN VẬT (bao gồm trường "dialogue" trong mảng timeline và các dòng 'Lời thoại tiếng Việt: "..."' trong prompts): Nhân vật nói chuyện tự nhiên bằng giọng người thật, gọi tên sản phẩm theo tên gọi/chủng loại tự nhiên (ví dụ: "chiếc máy này", "em gia dụng này", "chiếc nồi chiên này", "sản phẩm này", "món đồ tiện ích này").
   - TUYỆT ĐỐI KHÔNG ĐƯỢC để ký hiệu tag "@SANPHAM" hoặc "@NHANVAT" xuất hiện bên trong câu thoại nói miệng của nhân vật. Tag @SANPHAM chỉ dùng cho phần mô tả prompt hình ảnh kỹ thuật.
7. Quy tắc đặc sắc về phong cách thoại: 
   - Nếu phong cách thoại là "Hài hước bựa" (hoặc chứa từ "bựa", "comedy_crazy"): Bạn BẮT BUỘC phải viết lời thoại thật hài bựa, cực kỳ "lầy lội", dí dỏm độc lạ, bắt các trend hot xã hội, nhưng tuyệt đối không dùng từ tục tĩu, bậy bạ hay phản cảm (bựa nhưng lịch sự, văn minh).
   - Lời thoại bắt buộc phải sử dụng 100% giọng văn miền Bắc Việt Nam đặc trưng, dùng các từ ngữ cảm thán sành điệu như: "U là trời", "Nhá", "Thế nhở", "Ngoan xinh yêu", "Đỉnh chóp", "Ơ kìa", "Hú hồn", "Chuẩn đét", "Thì lại là hợp lý quá cơ", "Úi xùi", "Khét lẹt", "Nói thế cho nhanh", "Đẹp nhức nách", "Eo thề luôn",...
8. ${PLATFORM_COMPLIANCE_GUIDELINES}`
      : `Bạn là một chuyên gia biên kịch và thiết kế Prompt AI video thời trang hàng đầu châu Á. Nhiệm vụ của bạn là nhận thông tin sản phẩm và nhân vật để sinh ra một cấu trúc JSON kịch bản phân đoạn và DANH SÁCH CÁC PROMPT riêng lẻ (mỗi prompt dài đúng 10s, tương ứng với số phân cảnh cần thiết để đạt tổng thời lượng yêu cầu).
Dựa trên thông tin sản phẩm do người dùng cung cấp, bạn hãy đặt tên gọi ngắn gọn, sang trọng cho sản phẩm thời trang đó.
${isTransformationStyle 
  ? `ĐẶC BIỆT KHI SỬ DỤNG PHONG CÁCH BIẾN HÌNH THỜI TRANG / TRANSFORMATION / CHUYỂN CẢNH ĐỔI TRANG PHỤC:
- BẮT BUỘC sử dụng các tag sản phẩm theo thứ tự biến hình: @SANPHAM1 (trang phục ban đầu/trước khi biến hình), @SANPHAM2 (trang phục sau khi biến hình/lột xác ngoạn mục), @SANPHAM3 (nếu có biến hình lần 3), v.v.
- Trong prompt text mở đầu: Viết rõ "@NHANVAT mặc ban đầu @SANPHAM1 và biến hình sang @SANPHAM2 theo ảnh tham chiếu." và "Giữ nguyên 100% thiết kế, màu sắc, kiểu dáng, chất liệu và mọi chi tiết của @SANPHAM1, @SANPHAM2 theo ảnh tham chiếu."
- Trong các mốc hành động: mô tả rõ khoảnh khắc chuyển đổi từ @SANPHAM1 sang @SANPHAM2.`
  : `- Đặt tên sản phẩm đại diện làm tag @SANPHAM để dùng thống nhất trong toàn bộ kịch bản và prompt.`}
HÃY TRẢ VỀ DỮ LIỆU ĐỊNH DẠNG JSON KHÔNG ĐƯỢC CHỨA BẤT KỲ ĐOẠN DẪN NÀO NGOÀI JSON SẠCH MÔ TẢ ĐÚNG THEO KHUÔN MẪU.

QUY TẮC BẮT BUỘC VỀ ĐỘ DÀI LỜI THOẠI TRONG 10 GIÂY:
- Tổng số từ của lời thoại nhân vật trong mỗi clip 10 giây (hoặc tổng 3 mốc 0s-3s, 3s-6s, 6s-10s cộng lại) BẮT BUỘC PHẢI ĐẠT KHOẢNG 37 ĐẾN 42 TỪ.
- Lời thoại phải sành điệu, thời thượng, nhịp điệu cuốn hút bắt tai, ngắt câu hợp lý theo từng nhịp 3s để khi AI lồng tiếng đạt độ khớp hoàn hảo 100%.

Chú ý cấu trúc prompt & kịch bản:
1. Trong "prompt_text" của danh sách "prompts", tuyệt đối KHÔNG chứa khối thông tin mô tả rườm rà về nhân vật như "Nhân vật: Fashion creator nữ...".
2. Các khối thông số trong "prompt_text" (ví dụ: mở đầu, bối cảnh, HÀNH ĐỘNG:, yêu cầu thoại, yêu cầu hình ảnh) bắt buộc phải được ngăn cách rõ ràng bằng các dòng trống xuống dòng riêng biệt (phân tách dòng).
3. Mỗi phân cảnh video 10 giây bên trong "prompts" phải có phần "HÀNH ĐỘNG:" chia nhỏ chi tiết thành đúng 3 mốc thời gian: "0s - 3s", "3s - 6s" và "6s - 10s". Tổng lời thoại trong 3 mốc của mỗi prompt 10s phải đạt từ 37 đến 42 từ.
4. Cực kỳ quan trọng về liền mạch logic chuyển tiếp: Vì AI sinh từng video độc lập không biết được phân cảnh trước đó là gì, bạn bắt buộc phải thiết lập logic nối tiếp: cảnh đầu (mốc 0s - 3s) của prompt thứ hai trở đi phải tiếp tục trùng khớp và bắt đầu dựa theo trạng thái, tư thế đứng/chuyển động của cảnh cuối (mốc 6s - 10s) thuộc prompt liền trước để giữ tính liên tục hoàn hảo.
5. Trong mọi mô tả hành động hay vị trí bên trong "prompt_text" của danh mục "prompts", TUYỆT ĐỐI KHÔNG dùng từ "nhân vật" hay "người mẫu" hay "creator". Mọi vị trí đó BẮT BUỘC phải viết là "@NHANVAT" (Ví dụ: "@NHANVAT mỉm cười", "@NHANVAT xoay người nhẹ nhàng").
6. QUY TẮC CỰC KỲ QUAN TRỌNG VỀ LỜI THOẠI NHÂN VẬT VÀ TÊN SẢN PHẨM:
   - Trong TOÀN BỘ LỜI THOẠI NHÂN VẬT (bao gồm trường "dialogue" trong mảng timeline và các dòng 'Lời thoại tiếng Việt: "..."' trong prompts): Nhân vật nói chuyện tự nhiên bằng giọng người thật, gọi tên sản phẩm theo tên gọi/chủng loại tự nhiên (ví dụ: "chiếc đầm lụa này", "em áo blazer này", "set đồ này", "sản phẩm này", "thiết kế này").
   - TUYỆT ĐỐI KHÔNG ĐƯỢC để ký hiệu tag "@SANPHAM", "@SANPHAM1", "@SANPHAM2" hoặc "@NHANVAT" xuất hiện bên trong câu thoại nói miệng của nhân vật. Các tag này chỉ dùng cho phần mô tả prompt hình ảnh kỹ thuật.
7. Quy tắc đặc sắc về phong cách thoại: 
   - Nếu phong cách thoại là "Hài hước bựa" (hoặc chứa từ "bựa", "comedy_crazy"): Bạn BẮT BUỘC phải viết lời thoại thật hài bựa, cực kỳ "lầy lội", dí dỏm độc lạ, bắt các trend hot xã hội, nhưng tuyệt đối không dùng từ tục tĩu, bậy bạ hay phản cảm (bựa nhưng lịch sự, văn minh).
   - Lời thoại bắt buộc phải sử dụng 100% giọng văn miền Bắc Việt Nam đặc trưng, dùng các từ ngữ cảm thán sành điệu như: "U là trời", "Nhá", "Thế nhở", "Ngoan xinh yêu", "Đỉnh chóp", "Ơ kìa", "Hú hồn", "Chuẩn đét", "Thì lại là hợp lý quá cơ", "Úi xùi", "Khét lẹt", "Nói thế cho nhanh", "Đẹp nhức nách", "Eo thề luôn",...
8. ${PLATFORM_COMPLIANCE_GUIDELINES}`;

    const randomSeed = Math.floor(Math.random() * 1000000000) + "_" + Date.now();

    // Góc tiếp cận sáng tạo ngẫu nhiên cho từng lần bấm tạo
    const creativeHooks = [
      "Mở đầu bằng một câu cảm thán kinh ngạc / bất ngờ trước tính năng thực tế độc đáo",
      "Mở đầu bằng một câu hỏi gợi trúng vấn đề khó khăn/thói quen đời thường của người xem",
      "Mở đầu bằng lời thú nhận chân thật và cảm xúc ngạc nhiên sau khi tự tay trải nghiệm",
      "Mở đầu bằng một tình huống thực tế hài hước, dí dỏm và vô cùng quen thuộc",
      "Mở đầu bằng câu so sánh tương phản độc lạ, cuốn hút ngay lập tức",
      "Mở đầu bằng cách vào thẳng điểm chạm cảm xúc ấn tượng nhất của sản phẩm",
      "Mở đầu bằng lời khuyên chân thành, phá tan các e ngại hay định kiến trước đó",
      "Mở đầu bằng nhịp điệu hào hứng, tự nhiên như đang trò chuyện với người bạn thân"
    ];
    const chosenHook = creativeHooks[Math.floor(Math.random() * creativeHooks.length)];

    const ctaInstructionText = cta && typeof cta === "string" && cta.trim()
      ? `- Lời kêu gọi hành động (CTA) cuối video (Do người dùng yêu cầu): "${cta.trim()}". BẮT BUỘC phải đưa nội dung CTA này vào lời thoại ở phân cảnh kết thúc video (có thể tinh chỉnh khéo léo để phù hợp phong cách thoại và tuân thủ từ ngữ nền tảng).`
      : `- Lời kêu gọi hành động (CTA) cuối video: Hãy tự động sáng tạo một câu CTA kêu gọi hành động ngắn gọn, đủ ý, duyên dáng và bắt trend ở phân cảnh cuối video (tuân thủ 100% quy tắc nói giảm nói tránh các từ cấm như bấm góc trái, rước về, thêm vào giỏ...).`;

    const userPromptText = isAppliance
      ? `Hãy sáng tạo kịch bản AI HÀNG GIA DỤNG với các dữ liệu sau:
- Hạt giống ngẫu nhiên tạo lập độc nhất (Seed ID): ${randomSeed} (BẮT BUỘC SÁNG TẠO SỰ KHÁC BIỆT CỦA CẢNH QUAY VÀ LỜI THOẠI, KHÔNG DÙNG LẠI CÁC KỊCH BẢN CŨ).
- Góc tiếp cận mở đầu cho phiên tạo này: "${chosenHook}".
- QUY TẮC ĐẶC BIỆT VỀ LỜI THOẠI: Lời thoại sau mỗi lần bấm tạo kịch bản BẮT BUỘC phải là những từ ngữ mới mẻ, những cách mở đầu độc đáo khác nhau, mang cảm xúc ngôn từ phong phú và chân thật theo phong cách thoại "${tone}". TUYỆT ĐỐI KHÔNG CÓ GIAI ĐIỆU THOẠI HAY CÂU MỞ ĐẦU NÀO LÀ MẶC ĐỊNH (Cấm các câu rập khuôn như "Chào các bạn", "Hôm nay mình mang đến...", "Nếu bạn đang tìm...").
- BẮT BUỘC VỀ SỐ LƯỢNG TỪ THOẠI: Tổng số từ trong lời thoại của mỗi clip 10 giây (tổng cộng 3 mốc 0s-3s, 3s-6s, 6s-10s) BẮT BUỘC ĐẠT KHOẢNG 37 ĐẾN 42 TỪ.
- Nhân vật hoạt động: @NHANVAT (Smart home reviewer / creator Việt Nam trẻ trung, tự tin, biểu cảm tươi tắn tự nhiên, nói tiếng Việt truyền cảm, rõ ràng).
- HÀNH ĐỘNG CỐT LÕI CỦA NHÂN VẬT: ${isTablePlaced ? 'BẮT BUỘC là "@NHANVAT đặt sản phẩm @SANPHAM ngay ngắn tại bàn và nói", đứng hoặc ngồi cạnh bàn, hướng tay chỉ vào @SANPHAM, dùng một tay bấm nút/mở nắp/thao tác trực tiếp trên bàn và tương tác nói chuyện trước ống kính camera.' : 'BẮT BUỘC là "@NHANVAT cầm sản phẩm @SANPHAM trên tay và nói", dùng tay thao tác các tính năng/bấm nút/mở nắp/demo trực tiếp trên tay và hướng về phía máy quay.'}
- Thông tin & Điểm nổi bật sản phẩm gia dụng: ${highlights} (Hãy tự động nhận diện và đặt tên ngắn gọn đại diện cho món đồ gia dụng này làm tag @SANPHAM xuyên suốt kịch bản).
- Thời lượng tổng cộng: ${duration} giây (Yêu cầu chia thành đúng ${expectedSegmentsCount} phân cảnh Prompt 10s trong mảng "prompts").
- Phong cách thoại: "${tone}" (Mô tả phong cách: hãy viết lời thoại bám sát phong cách này một cách tự nhiên nhất, dùng từ ngữ biến hóa sinh động).
- Bối cảnh không gian quay: "${style}"
${ctaInstructionText}

YÊU CẦU QUAN TRỌNG VỀ TỪ NGỮ NÓI GIẢM NÓI TRÁNH TRONG LỜI THOẠI:
${PLATFORM_COMPLIANCE_GUIDELINES}

LƯU Ý: Trong lời thoại nhân vật, gọi tên sản phẩm tự nhiên (ví dụ: "chiếc máy này", "em nồi chiên này", "sản phẩm"), TUYỆT ĐỐI KHÔNG để tag "@SANPHAM" lọt vào câu thoại nói miệng!

Yêu cầu chi tiết cho các mốc thời gian (timeline):
Hãy chia nhỏ tổng thời lượng ${duration}s ra các mốc ngắn cứ 3s chuyển cảnh một lần (ví dụ: "0s - 3s", "3s - 6s", "6s - 10s", "10s - 13s", "13s - 16s", "16s - 20s"...). Mỗi mốc phải có mô tả hành động ${isTablePlaced ? "đặt sản phẩm tại bàn và thao tác chi tiết" : "cầm sản phẩm trên tay và thao tác chi tiết"}, chuyển động máy quay rõ nét, biểu cảm tự nhiên và lời thoại tiếng Việt đúng tone. Trong mỗi đoạn 10 giây (3 mốc cộng lại), lời thoại nhân vật phải đạt độ dài khoảng 37 - 42 từ và TUÂN THỦ 100% QUY TẮC NÓI GIẢM NÓI TRÁNH TỪ CẤM NỀN TẢNG.

Yêu cầu cực kỳ quan trọng cho danh sách "prompts":
Bạn cần tạo ra chính xác đúng ${expectedSegmentsCount} phần tử prompt, tương ứng với ${expectedSegmentsCount} phân đoạn dài 10 giây nối tiếp nhau (ví dụ: Phân cảnh 1 là "0s - 10s", Phân cảnh 2 là "10s - 20s", v.v.).

Mỗi phần tử phải chứa 2 trường thông số:
1) Trường "prompt_text" được định dạng chuẩn xác bằng Tiếng Việt cấu trúc y hệt sau, các thông số phải cách nhau bởi dòng trống (xuống dòng rõ rệt):

${isTablePlaced ? "@NHANVAT đặt sản phẩm @SANPHAM ngay ngắn tại bàn, thao tác trực tiếp và nói chuyện trước ống kính." : "@NHANVAT cầm sản phẩm @SANPHAM trên tay, thao tác trực tiếp và nói chuyện trước ống kính."}

Giữ nguyên 100% thiết kế, kiểu dáng, màu sắc, chất liệu và mọi chi tiết nút bấm của @SANPHAM theo ảnh tham chiếu.

Tạo video gia dụng dọc 9:16 dài 10 giây.

Bối cảnh:
${stylePrompt} Ánh sáng tự nhiên ấm cúng tinh tế. Phong cách smart home lifestyle reviewer chân thực chuyên nghiệp.

HÀNH ĐỘNG:
${isTablePlaced ? `- 0s - 3s: [Mô tả chi tiết @NHANVAT đứng/ngồi bên bàn với @SANPHAM đặt ngay ngắn trước mặt, tươi cười giới thiệu và dùng tay chỉ về phía sản phẩm hướng ánh mắt về camera. Đối với prompt số 2 trở đi, phần này phải bắt đầu chính xác từ tư thế đứng/ngồi thao tác ở mốc 6s-10s của prompt trước đó để duy trì tối đa tính nhất quán]. Lời thoại tiếng Việt: "[Lời thoại 10-14 từ, tuân thủ nói giảm nói tránh từ cấm, không chứa tag @SANPHAM]"
- 3s - 6s: [Mô tả chi tiết @NHANVAT dùng một tay thao tác bấm phím/mở nắp @SANPHAM đặt trên bàn, biểu cảm chân thực ấn tượng]. Lời thoại tiếng Việt: "[Lời thoại 12-15 từ, tuân thủ nói giảm nói tránh từ cấm, không chứa tag @SANPHAM]"
- 6s - 10s: [Mô tả chi tiết @NHANVAT đặt tay nhẹ bên cạnh @SANPHAM trên bàn, nở nụ cười tự tin và đưa ra lời khuyên trải nghiệm, giữ tư thế sẵn sàng để nối sang prompt tiếp theo]. Lời thoại tiếng Việt: "[Lời thoại 12-15 từ, tuân thủ nói giảm nói tránh từ cấm, không chứa tag @SANPHAM]"` : `- 0s - 3s: [Mô tả chi tiết @NHANVAT cầm chắc @SANPHAM trên tay ngang tầm ngực, tươi cười giới thiệu và hướng góc sản phẩm về phía máy quay. Đối với prompt số 2 trở đi, phần này phải bắt đầu chính xác từ tư thế cầm/thao tác ở mốc 6s-10s của prompt trước đó để duy trì tối đa tính nhất quán]. Lời thoại tiếng Việt: "[Lời thoại 10-14 từ, tuân thủ nói giảm nói tránh từ cấm, không chứa tag @SANPHAM]"
- 3s - 6s: [Mô tả chi tiết @NHANVAT dùng tay thao tác trực tiếp trên @SANPHAM (bấm nút/mở nắp/cầm demo tính năng), biểu cảm ấn tượng]. Lời thoại tiếng Việt: "[Lời thoại 12-15 từ, tuân thủ nói giảm nói tránh từ cấm, không chứa tag @SANPHAM]"
- 6s - 10s: [Mô tả chi tiết @NHANVAT cầm @SANPHAM giơ nhẹ trước ống kính, nở nụ cười tự tin và đưa ra lời khuyên trải nghiệm, giữ tư thế sẵn sàng để nối sang prompt tiếp theo]. Lời thoại tiếng Việt: "[Lời thoại 12-15 từ, tuân thủ nói giảm nói tránh từ cấm, không chứa tag @SANPHAM]"`}

(Lưu ý: Tổng số từ của 3 câu thoại trong mỗi phân cảnh 10s trên phải đạt khoảng 37 - 42 từ)

2) Trường "prompt_text_en" là bản dịch chất lượng cao 100% tương ứng của toàn bộ nội dung "prompt_text" kể trên sang Tiếng Anh chuyên nghiệp, tối ưu từ vựng và ngôn ngữ để các trình sinh video AI (Luma, Kling, Runway Gen-3) hiểu chính xác nhất. Luôn giữ nguyên các tag đặc biệt như @NHANVAT, @SANPHAM trong bản dịch tiếng Anh.

Yêu cầu cực kỳ quan trọng cho danh sách "hooks":
Hãy sáng tạo đúng 5 tiêu đề Hook (tiêu đề giật tít siêu cuốn hút, kích thích sự tò mò hoặc đánh trúng tâm lý, nhu cầu, nỗi đau và thói quen của người xem video ngắn TikTok/Reels/Shorts).
Với mỗi tiêu đề Hook, BẮT BUỘC cung cấp đúng 3 hashtag liên quan (bắt đầu bằng dấu #) tối ưu xu hướng và thuật toán tìm kiếm.

Yêu cầu thoại:
Nói hoàn toàn bằng tiếng Việt.
Giọng Việt Nam tự nhiên, chân thật, hào hứng đúng ngữ điệu "${tone}".
Khẩu hình khớp lời nói 100%.

  Yêu cầu hình ảnh:
${isTablePlaced ? "Ultra Realistic Home Appliance Video, Tabletop Product Demonstration, Smart Gadget Review, Cinematic Lighting, 8K Ultra Detailed, Realistic Physics, Professional Creator." : "Ultra Realistic Home Appliance Video, Smart Gadget Review, Hands-on Product Demonstration, Cinematic Lighting, 8K Ultra Detailed, Realistic Tactile Physics, Professional Creator."}
Không phụ đề, không chữ trên màn hình, không logo, không watermark.`
      : `Hãy sáng tạo kịch bản thời trang với các dữ liệu sau:
- Hạt giống ngẫu nhiên tạo lập độc nhất (Seed ID): ${randomSeed} (BẮT BUỘC SÁNG TẠO SỰ KHÁC BIỆT CỦA CẢNH QUAY VÀ LỜI THOẠI, KHÔNG DÙNG LẠI CÁC KỊCH BẢN CŨ, KHÔNG CÓ BẤT KỲ MẶC ĐỊNH NÀO).
- Góc tiếp cận mở đầu cho phiên tạo này: "${chosenHook}".
- QUY TẮC ĐẶC BIỆT VỀ LỜI THOẠI: Lời thoại sau mỗi lần bấm tạo kịch bản BẮT BUỘC phải là những từ ngữ mới mẻ, những cách mở đầu độc đáo khác nhau, mang cảm xúc ngôn từ phong phú và thần thái cuốn hút theo phong cách thoại "${tone}". TUYỆT ĐỐI KHÔNG CÓ GIAI ĐIỆU THOẠI HAY CÂU MỞ ĐẦU NÀO LÀ MẶC ĐỊNH (Cấm các câu rập khuôn như "Chào các bạn", "Hôm nay mình mặc...", "Nếu bạn đang tìm...").
- BẮT BUỘC VỀ SỐ LƯỢNG TỪ THOẠI: Tổng số từ trong lời thoại của mỗi clip 10 giây (tổng cộng 3 mốc 0s-3s, 3s-6s, 6s-10s) BẮT BUỘC ĐẠT KHOẢNG 37 ĐẾN 42 TỪ.
- Nhân vật hoạt động: @NHANVAT (Fashion creator nữ Việt Nam trẻ trung, tự tin, biểu cảm tự nhiên, nói tiếng Việt giọng rõ ràng).
- Thông tin & Điểm nổi bật sản phẩm: ${highlights} ${isTransformationStyle ? '(ĐÂY LÀ PHONG CÁCH BIẾN HÌNH THỜI TRANG: Hãy tự động nhận diện và gán các trang phục theo chuỗi biến hình @SANPHAM1, @SANPHAM2, @SANPHAM3... ví dụ @SANPHAM1 là set đồ xuề xòa/bình dân ban đầu, @SANPHAM2 là set đồ thiết kế cao cấp sang chảnh sau khi biến hình).' : '(Hãy tự động nhận diện và đặt tên ngắn gọn đại diện cho sản phẩm thời trang này làm tag @SANPHAM xuyên suốt kịch bản).'}
- Thời lượng tổng cộng: ${duration} giây (Yêu cầu chia thành đúng ${expectedSegmentsCount} phân cảnh Prompt 10s trong mảng "prompts").
- Phong cách thoại: "${tone}" (Mô tả phong cách: hãy viết lời thoại bám sát phong cách này một cách tự nhiên nhất, dùng từ ngữ biến hóa sinh động).
- Bối cảnh quay: "${style}"
${ctaInstructionText}

YÊU CẦU QUAN TRỌNG VỀ TỪ NGỮ NÓI GIẢM NÓI TRÁNH TRONG LỜI THOẠI:
${PLATFORM_COMPLIANCE_GUIDELINES}

LƯU Ý: Trong lời thoại nhân vật, gọi tên sản phẩm tự nhiên (ví dụ: "chiếc đầm này", "em áo này", "sản phẩm"), TUYỆT ĐỐI KHÔNG để các tag như "@SANPHAM", "@SANPHAM1", "@SANPHAM2" lọt vào câu thoại nói miệng!

Yêu cầu chi tiết cho các mốc thời gian (timeline):
Hãy chia nhỏ tổng thời lượng ${duration}s ra các mốc ngắn cứ 3s chuyển cảnh một lần (ví dụ: "0s - 3s", "3s - 6s", "6s - 10s", "10s - 13s", "13s - 16s", "16s - 20s"...). Mỗi mốc phải có mô tả hành động thời trang cực kỳ chi tiết, chuyển động máy quay mềm mại, biểu cảm tự nhiên và lời thoại tiếng Việt đúng tone, biến hóa câu từ phong phú. Trong mỗi đoạn 10 giây (3 mốc cộng lại), lời thoại nhân vật phải đạt độ dài khoảng 37 - 42 từ và TUÂN THỦ 100% QUY TẮC NÓI GIẢM NÓI TRÁNH TỪ CẤM NỀN TẢNG.

Yêu cầu cực kỳ quan trọng cho danh sách "prompts":
Bạn cần tạo ra chính xác đúng ${expectedSegmentsCount} phần tử prompt, tương ứng với ${expectedSegmentsCount} phân đoạn dài 10 giây nối tiếp nhau (ví dụ: Phân cảnh 1 là "0s - 10s", Phân cảnh 2 là "10s - 20s", v.v.).

Mỗi phần tử phải chứa 2 trường thông số:
1) Trường "prompt_text" được định dạng chuẩn xác bằng Tiếng Việt cấu trúc y hệt sau, các thông số phải cách nhau bởi dòng trống (xuống dòng rõ rệt):

${isTransformationStyle 
? `@NHANVAT mặc ban đầu @SANPHAM1 và biến hình sang @SANPHAM2 theo ảnh tham chiếu.

Giữ nguyên 100% thiết kế, màu sắc, kiểu dáng, chất liệu và mọi chi tiết của @SANPHAM1, @SANPHAM2 theo ảnh tham chiếu.`
: `@NHANVAT mặc chính xác @SANPHAM theo ảnh tham chiếu.

Giữ nguyên 100% thiết kế, màu sắc, kiểu dáng, chất liệu và mọi chi tiết của @SANPHAM.`}

Tạo video thời trang dọc 9:16 dài 10 giây.

Bối cảnh:
${stylePrompt} Ánh sáng tự nhiên tinh khôi. Phong cách lifestyle fashion creator chuyên nghiệp.

HÀNH ĐỘNG:
${isTransformationStyle
? `- 0s - 3s: [Mô tả chi tiết @NHANVAT mặc @SANPHAM1 với góc máy cận cảnh/trung cảnh, chuẩn bị cho cú chuyển động biến hình]. Lời thoại tiếng Việt: "[Lời thoại 10-14 từ, tuân thủ nói giảm nói tránh từ cấm, không chứa tag @SANPHAM]"\n- 3s - 6s: [Mô tả chi tiết khoảnh khắc drop beat cực cháy, chuyển cảnh mượt mà biến hình lột xác sang @SANPHAM2 với biểu cảm thần thái rạng rỡ]. Lời thoại tiếng Việt: "[Lời thoại 12-15 từ, tuân thủ nói giảm nói tránh từ cấm, không chứa tag @SANPHAM]"\n- 6s - 10s: [Mô tả chi tiết @NHANVAT tạo dáng catwalk tự tin trong trang phục @SANPHAM2, khoe trọn phom dáng và chất liệu sang chảnh, giữ tư thế sẵn sàng để nối sang prompt tiếp theo]. Lời thoại tiếng Việt: "[Lời thoại 12-15 từ, tuân thủ nói giảm nói tránh từ cấm, không chứa tag @SANPHAM]"`
: `- 0s - 3s: [Mô tả chi tiết hành động @NHANVAT và bối cảnh góc máy lúc này. Đối với prompt số 2 trở đi, phần này phải bắt đầu chính xác từ tư thế kết thúc của mốc 6s-10s ở prompt trước đó để duy trì tối đa tính nhất quán]. Lời thoại tiếng Việt: "[Lời thoại 10-14 từ, tuân thủ nói giảm nói tránh từ cấm, không chứa tag @SANPHAM]"\n- 3s - 6s: [Mô tả chi tiết góc quay và biểu cảm @NHANVAT trong 3s tiếp theo]. Lời thoại tiếng Việt: "[Lời thoại 12-15 từ, tuân thủ nói giảm nói tránh từ cấm, không chứa tag @SANPHAM]"\n- 6s - 10s: [Mô tả chi tiết hành động cuối phân cảnh của @NHANVAT, giữ tư thế sẵn sàng để nối sang prompt tiếp theo]. Lời thoại tiếng Việt: "[Lời thoại 12-15 từ, tuân thủ nói giảm nói tránh từ cấm, không chứa tag @SANPHAM]"`}

(Lưu ý: Tổng số từ của 3 câu thoại trong mỗi phân cảnh 10s trên phải đạt khoảng 37 - 42 từ)

2) Trường "prompt_text_en" là bản dịch chất lượng cao 100% tương ứng của toàn bộ nội dung "prompt_text" kể trên sang Tiếng Anh chuyên nghiệp, tối ưu từ vựng và ngôn ngữ để các trình sinh video AI (Luma, Kling, Runway Gen-3) hiểu chính xác nhất. Luôn giữ nguyên các tag đặc biệt như @NHANVAT, ${isTransformationStyle ? '@SANPHAM1, @SANPHAM2' : '@SANPHAM'} trong bản dịch tiếng Anh.

Yêu cầu cực kỳ quan trọng cho danh sách "hooks":
Hãy sáng tạo đúng 5 tiêu đề Hook (tiêu đề giật tít siêu cuốn hút, kích thích sự tò mò hoặc đánh trúng tâm lý, nhu cầu, nỗi đau và thói quen của người xem video ngắn TikTok/Reels/Shorts).
Với mỗi tiêu đề Hook, BẮT BUỘC cung cấp đúng 3 hashtag liên quan (bắt đầu bằng dấu #) tối ưu xu hướng và thuật toán tìm kiếm.

Yêu cầu thoại:
Nói hoàn toàn bằng tiếng Việt.
Giọng Việt Nam tự nhiên, biểu cảm thần thái sang chảnh quyến rũ đúng ngữ điệu "${tone}".
Khẩu hình khớp lời nói 100%.

Yêu cầu hình ảnh:
Ultra Realistic Fashion Video, Luxury Fashion Content, Cinematic Camera Movement, 8K Ultra Detailed, Natural Lighting, Realistic Fabric Physics, Professional Fashion Creator.
Không phụ đề, không chữ trên màn hình, không logo, không watermark.`;

    const response = await generateContentWithRetry(
      ai,
      {
        contents: userPromptText,
        config: {
          systemInstruction: systemInstruction,
          temperature: 1.15,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              timeline: {
                type: Type.ARRAY,
                description: isAppliance 
                  ? "Danh sách chuỗi các mốc thời gian cứ 3 giây một phân đoạn nhân vật cầm sản phẩm trên tay và nói"
                  : "Danh sách chuỗi các mốc thời gian cứ 3 giây một phân đoạn chuyển cảnh",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING, description: "Các mốc thời gian chia đều 3s kết thúc bằng 10s, ví dụ: '0s - 3s', '3s - 6s', '6s - 10s', '10s - 13s', '13s - 16s', '16s - 20s'..." },
                    action: { type: Type.STRING, description: isAppliance ? "Hành động @NHANVAT cầm @SANPHAM trên tay và thao tác chi tiết" : "Hành động cực kỳ cụ thể của @NHANVAT, ví dụ: '@NHANVAT cười tươi, xoay nhẹ đầm trước ống kính'" },
                    dialogue: { type: Type.STRING, description: "Lời thoại tiếng Việt sành điệu, bắt trend của nhân vật (không dùng tag @SANPHAM trong lời thoại)" }
                  },
                  required: ["time", "action", "dialogue"]
                }
              },
              prompts: {
                type: Type.ARRAY,
                description: isAppliance
                  ? "Danh sách prompt cụ thể cho các phân đoạn 10 giây của AI Video Gia Dụng (Cầm trên tay và nói)"
                  : "Danh sách prompt cụ thể cho các phân đoạn 10 giây của AI Video",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    segment: { type: Type.STRING, description: "Phần ví dụ: 'Phân cảnh 1 (0s - 10s)'" },
                    prompt_text: { type: Type.STRING, description: "Prompt chi tiết gốc tiếng Việt với bối cảnh, HÀNH ĐỘNG @NHANVAT và yêu cầu" },
                    prompt_text_en: { type: Type.STRING, description: "Bản dịch prompt tương ứng chất lượng cao sang Tiếng Anh để sinh video AI" }
                  },
                  required: ["segment", "prompt_text", "prompt_text_en"]
                }
              },
              hooks: {
                type: Type.ARRAY,
                description: "Danh sách đúng 5 gợi ý tiêu đề Hook giật tít, siêu thu hút kèm đúng 3 hashtag liên quan chất lượng cao",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Tiêu đề Hook ấn tượng giật tít thu hút người xem" },
                    hashtags: {
                      type: Type.ARRAY,
                      description: "Đúng 3 hashtag liên quan chất lượng cao (bắt đầu bằng #)",
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["title", "hashtags"]
                }
              }
            },
            required: ["timeline", "prompts", "hooks"]
          }
        }
      },
      ["gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-3.5-flash"]
    );

    const dataText = response.text;
    if (!dataText) {
      throw new Error("Không nhận được phản hồi văn bản từ Gemini API.");
    }

    const parsedJson = JSON.parse(dataText.trim());

    // Sanitize restricted terms and clean dialogue from accidental @SANPHAM tags
    if (parsedJson && Array.isArray(parsedJson.timeline)) {
      parsedJson.timeline = parsedJson.timeline.map((item: any) => ({
        ...item,
        dialogue: cleanDialogueText(item.dialogue || ""),
        action: sanitizePlatformEuphemisms(item.action || "")
      }));
    }

    if (parsedJson && Array.isArray(parsedJson.hooks)) {
      parsedJson.hooks = parsedJson.hooks.map((h: any) => ({
        title: sanitizePlatformEuphemisms(h.title || ""),
        hashtags: Array.isArray(h.hashtags) 
          ? h.hashtags.map((tag: any) => {
              const str = String(tag || "").trim();
              return str.startsWith("#") ? str : `#${str}`;
            }).filter(Boolean).slice(0, 3)
          : []
      })).slice(0, 5);
    }

    if (parsedJson && Array.isArray(parsedJson.prompts)) {
      parsedJson.prompts = parsedJson.prompts.map((p: any) => {
        let pt = p.prompt_text || "";
        // Replace any "HÀNH ĐỘNG @NHANVAT:" with "HÀNH ĐỘNG:"
        pt = pt.replace(/HÀNH ĐỘNG\s*@NHANVAT\s*:/gi, "HÀNH ĐỘNG:");
        // Clean up any @SANPHAM or restricted terms inside Lời thoại of prompt_text
        pt = pt.replace(/(Lời thoại[^:]*:\s*["'])([^"']+)(["'])/gi, (_m: string, pre: string, text: string, post: string) => {
          return pre + cleanDialogueText(text) + post;
        });
        pt = sanitizePlatformEuphemisms(pt);
        return {
          ...p,
          prompt_text: pt
        };
      });
    }

    res.json(parsedJson);
  } catch (error: any) {
    console.error("Generate error:", error);
    let errMsg = error?.message || "Lỗi xử lý sinh kịch bản.";
    try {
      if (typeof errMsg === "string" && errMsg.trim().startsWith("{")) {
        const parsed = JSON.parse(errMsg);
        if (parsed?.error?.message) errMsg = parsed.error.message;
      }
    } catch {}
    res.status(500).json({ error: errMsg });
  }
});

// REST route for Text-to-Speech (TTS) rendering
app.post("/api/tts", async (req, res) => {
  try {
    const { text, tone, customApiKey } = req.body;

    if (!text) {
      res.status(400).json({ error: "Nội dung văn bản để đọc là bắt buộc." });
      return;
    }

    const apiKey = customApiKey || (req.headers["x-custom-api-key"] as string);
    const ai = getGenAI(apiKey);

    // Determine tone directives
    let speedPrompt = "Đọc bằng tiếng Việt giọng nữ trẻ trung tự nhiên ngọt ngào đầy cuốn hút.";
    if (tone === "Năng lượng") {
      speedPrompt = "Hãy nói cực kỳ hào hứng, năng động, tươi vui, giọng to rõ ràng nhấn mạnh các từ khoá!";
    } else if (tone === "Chân thật" || tone === "Nghiêm túc") {
      speedPrompt = "Đọc chậm rãi, tông giọng ấm áp, chân thành, sâu lắng, nhịp điệu vừa phải.";
    } else if (tone === "Hài hước bựa") {
      speedPrompt = "Đọc bằng giọng nữ miền Bắc Việt Nam dí dỏm, biểu cảm cực kỳ hài bựa lầy lội bắt trend nhưng rõ ràng lời nói và mang lại tiếng cười sành điệu.";
    } else if (tone === "Hài hước") {
      speedPrompt = "Nói bằng giọng nữ miền Bắc vui vẻ, dí dỏm, biểu cảm siêu hài hước thú vị.";
    }

    const promptText = `Nói rõ ràng và chuẩn xác: ${text}. (${speedPrompt})`;

    const response = await generateContentWithRetry(
      ai,
      {
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" }, // Best warm Vietnamese voice option
            },
          },
        },
      },
      ["gemini-3.1-flash-tts-preview"]
    );

    const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (inlineData && inlineData.data) {
      res.json({
        audioData: inlineData.data,
        mimeType: inlineData.mimeType || "audio/pcm;rate=24000",
      });
    } else {
      throw new Error("Không thể trích xuất dữ liệu âm thanh từ phản hồi TTS.");
    }
  } catch (error: any) {
    console.error("TTS error:", error);
    let errMsg = error?.message || "Lỗi tạo giọng nói nhân tạo.";
    try {
      if (typeof errMsg === "string" && errMsg.trim().startsWith("{")) {
        const parsed = JSON.parse(errMsg);
        if (parsed?.error?.message) errMsg = parsed.error.message;
      }
    } catch {}
    res.status(500).json({ error: errMsg });
  }
});

// Explicit 404 for unmatched /api routes so they return JSON, never Vite HTML
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `Không tìm thấy API endpoint ${req.method} ${req.path}` });
});

// Setup Vite Dev Server / Static files handler
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FashionAI Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
