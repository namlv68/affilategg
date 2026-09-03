// Safe API fetch helper to prevent "Unexpected token 'T', 'The page c'... is not valid JSON" errors
// Handles non-JSON responses (HTML error pages, timeouts, 502/504), unwraps nested error JSONs,
// and converts technical error codes into user-friendly Vietnamese messages.

export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch (netErr: any) {
    if (netErr?.name === "AbortError") {
      throw new Error("Yêu cầu đã bị hủy hoặc quá thời gian chờ (timeout). Vui lòng thử lại.");
    }
    throw new Error("Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.");
  }

  const rawText = await response.text();
  let data: any = null;

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch (_jsonErr) {
    // If response failed to parse as JSON, it is an HTML error page, proxy error, or plain text
    if (!response.ok) {
      if (response.status === 504 || response.status === 502) {
        throw new Error(`Máy chủ đang phản hồi chậm hoặc đang khởi động lại (Mã ${response.status}). Vui lòng thử lại sau vài giây.`);
      }
      if (response.status === 404) {
        throw new Error("Dịch vụ API không tìm thấy (404). Vui lòng tải lại trang.");
      }
      if (response.status === 403) {
        throw new Error("Phiên làm việc đã hết hạn hoặc không có quyền truy cập (403).");
      }
      if (rawText.toLowerCase().includes("the page") || rawText.includes("<html") || rawText.includes("<!doctype")) {
        throw new Error(`Máy chủ tạm thời bận hoặc quá tải (Mã ${response.status}). Vui lòng bấm thử lại.`);
      }
      throw new Error(`Lỗi máy chủ (${response.status}): ${rawText.slice(0, 100)}`);
    }
    throw new Error("Phản hồi từ máy chủ không đúng định dạng JSON. Vui lòng thử lại.");
  }

  if (!response.ok) {
    let errMessage = data?.error || `Yêu cầu thất bại với mã lỗi ${response.status}`;

    // Handle nested stringified JSON error objects
    if (typeof errMessage === "string" && (errMessage.trim().startsWith("{") || errMessage.trim().startsWith("["))) {
      try {
        const parsed = JSON.parse(errMessage);
        if (parsed?.error?.message) {
          errMessage = parsed.error.message;
        }
      } catch {}
    }

    // Convert technical Gemini API errors into friendly Vietnamese explanations
    if (typeof errMessage === "string") {
      if (errMessage.includes("API key not valid") || errMessage.includes("API_KEY_INVALID")) {
        errMessage = "API KEY của bạn không hợp lệ hoặc đã bị khóa. Vui lòng kiểm tra và dán lại Gemini API KEY chính xác từ Google AI Studio.";
      } else if (errMessage.includes("RESOURCE_EXHAUSTED") || errMessage.includes("Quota exceeded") || errMessage.includes("429")) {
        errMessage = "API KEY đã đạt giới hạn lượt gọi (Quota limit). Vui lòng thử lại sau 30 giây hoặc sử dụng API Key khác.";
      } else if (errMessage.includes("high demand") || errMessage.includes("503")) {
        errMessage = "Hệ thống AI đang tiếp nhận lưu lượng cao. Vui lòng bấm thử lại.";
      }
    }

    throw new Error(errMessage);
  }

  return data as T;
}
