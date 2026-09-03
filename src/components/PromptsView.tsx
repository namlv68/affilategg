import React, { useState } from "react";
import { PromptSegment, HookSuggestion } from "../types";
import { Copy, Check, Edit3, RefreshCw, Download, Globe } from "lucide-react";
import { safeFetchJson } from "../lib/api";

interface PromptsViewProps {
  prompts: PromptSegment[];
  hooks?: HookSuggestion[];
  onPromptChange: (index: number, newText: string, lang?: "vi" | "en") => void;
  customApiKey?: string;
  onOpenKeyManager?: () => void;
}

export default function PromptsView({ prompts, hooks, onPromptChange, customApiKey, onOpenKeyManager }: PromptsViewProps) {
  const [copiedAll, setCopiedAll] = useState(false);

  const handleDownloadAll = () => {
    let doc = `=== KỊCH BẢN PROMPT AI VIDEO THỜI TRANG & GIA DỤNG ===\n`;
    doc += `Liên hệ hỗ trợ: Nam 098.102.8794\n\n`;

    if (hooks && hooks.length > 0) {
      doc += `==================================================\n`;
      doc += `🔥 GỢI Ý 5 TIÊU ĐỀ HOOK & HASHTAG XU HƯỚNG\n`;
      doc += `==================================================\n\n`;
      hooks.forEach((h, idx) => {
        doc += `${idx + 1}. ${h.title}\n   Hashtag: ${h.hashtags.join(" ")}\n\n`;
      });
      doc += `\n`;
    }
    
    prompts.forEach((p, idx) => {
      doc += `--------------------------------------------------\n`;
      doc += `${p.segment || `PHÂN CẢNH ${idx + 1} (${idx * 10}s - ${(idx + 1) * 10}s)`}\n`;
      doc += `--------------------------------------------------\n\n`;
      
      doc += `[PROMPT TIẾNG VIỆT]\n`;
      doc += `${p.prompt_text}\n\n`;
      
      doc += `[PROMPT TIẾNG ANH]\n`;
      doc += `${p.prompt_text_en || '(Chưa có bản dịch)'}\n\n`;
      doc += `\n`;
    });
    
    const blob = new Blob([doc], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "NAM_AI_Prompts_Va_Hooks.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div id="prompts-view-container" className="space-y-4">
      {/* Header action bar with download option */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center space-x-1.5">
            <Globe className="w-4 h-4 text-luxury-500" />
            <span>Xử lý &amp; Xuất bản Prompt Song Ngữ</span>
          </h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Bản tự động dịch hoặc viết lại giúp đồng điệu mượt mà giữa các nền tảng AI nội địa và thế giới
          </p>
        </div>
        <button
          onClick={handleDownloadAll}
          className="flex items-center justify-center space-x-2 bg-luxury-600 hover:bg-luxury-500 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-lg shadow-luxury-900/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{copiedAll ? "Đang tải về..." : "Tải xuống tất cả Prompt (.txt)"}</span>
        </button>
      </div>

      {/* Dynamic prompt segments rendering */}
      <div id="promptsListContainer" className="space-y-6">
        {prompts.map((p, idx) => (
          <PromptCard 
            key={idx} 
            index={idx} 
            promptSegment={p} 
            customApiKey={customApiKey}
            onOpenKeyManager={onOpenKeyManager}
            onChange={(text, lang) => onPromptChange(idx, text, lang)} 
          />
        ))}
      </div>
    </div>
  );
}

interface PromptCardProps {
  key?: React.Key | number;
  promptSegment: PromptSegment;
  index: number;
  customApiKey?: string;
  onOpenKeyManager?: () => void;
  onChange: (text: string, lang: "vi" | "en") => void;
}

function PromptCard({ promptSegment, index, customApiKey, onOpenKeyManager, onChange }: PromptCardProps) {
  const [copiedVi, setCopiedVi] = useState(false);
  const [copiedEn, setCopiedEn] = useState(false);
  const [translating, setTranslating] = useState(false);

  const handleCopyVi = () => {
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = promptSegment.prompt_text;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextArea);

    setCopiedVi(true);
    setTimeout(() => setCopiedVi(false), 1500);
  };

  const handleCopyEn = () => {
    const textToCopy = promptSegment.prompt_text_en || "";
    if (!textToCopy) return;
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = textToCopy;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextArea);

    setCopiedEn(true);
    setTimeout(() => setCopiedEn(false), 1500);
  };

  const handleSyncToEnglish = async () => {
    if (!customApiKey || !customApiKey.trim()) {
      if (onOpenKeyManager) {
        onOpenKeyManager();
      }
      return;
    }
    if (!promptSegment.prompt_text.trim()) return;
    setTranslating(true);
    try {
      const data = await safeFetchJson<{ translatedText?: string }>("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-custom-api-key": customApiKey || "",
        },
        body: JSON.stringify({ 
          text: promptSegment.prompt_text,
          customApiKey: customApiKey 
        }),
      });
      if (data.translatedText) {
        onChange(data.translatedText, "en");
      }
    } catch (err) {
      console.error("Translate error:", err);
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
      {/* Prompt Card Header */}
      <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-luxury-500 animate-pulse"></span>
          <h5 className="text-xs font-bold text-white uppercase tracking-wider">
            {promptSegment.segment || `Phân cảnh ${index + 1} (${index * 10}s - ${(index + 1) * 10}s)`}
          </h5>
        </div>
      </div>

      {/* Grid container: Vi - En */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
        
        {/* VIETNAMESE PANEL */}
        <div className="p-4 flex flex-col space-y-3 bg-slate-950">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 uppercase">
              Chỉ dẫn Tiếng Việt
            </span>
            <button
              onClick={handleCopyVi}
              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                copiedVi 
                  ? "bg-emerald-600 text-white" 
                  : "bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {copiedVi ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedVi ? "Đã Copy VI" : "Copy Tiếng Việt"}</span>
            </button>
          </div>

          <div className="relative group flex-grow">
            <textarea
              value={promptSegment.prompt_text}
              onChange={(e) => onChange(e.target.value, "vi")}
              className="w-full h-80 bg-slate-900/30 text-slate-350 p-3 font-mono text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-luxury-500/40 resize-none border border-slate-800 rounded-lg block"
              placeholder="Nhập prompt nâng cao tại đây..."
            />
            <div className="absolute bottom-2 right-3 pointer-events-none text-[9px] text-slate-600 group-focus-within:text-luxury-500 flex items-center space-x-1 transition-colors">
              <Edit3 className="w-3 h-3" />
              <span>Chỉnh sửa trực tiếp</span>
            </div>
          </div>

          <div>
            <button
              onClick={handleSyncToEnglish}
              disabled={translating}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 border transition-all cursor-pointer ${
                translating
                  ? "bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-luxury-600/10 hover:bg-luxury-600/20 border-luxury-500/30 text-luxury-300 hover:text-white"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${translating ? "animate-spin text-slate-500" : "text-luxury-400"}`} />
              <span>{translating ? "Đang dịch kịch bản & đồng bộ..." : "Đồng bộ sang Prompt Tiếng Anh"}</span>
            </button>
          </div>
        </div>

        {/* ENGLISH PANEL */}
        <div className="p-4 flex flex-col space-y-3 bg-slate-950">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 uppercase">
              English AI Prompt
            </span>
            <button
              onClick={handleCopyEn}
              disabled={!promptSegment.prompt_text_en}
              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                !promptSegment.prompt_text_en
                  ? "bg-transparent text-slate-700 border border-transparent cursor-not-allowed"
                  : copiedEn 
                    ? "bg-emerald-600 text-white" 
                    : "bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {copiedEn ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedEn ? "Đã Copy EN" : "Copy Tiếng Anh"}</span>
            </button>
          </div>

          <div className="relative group flex-grow">
            <textarea
              value={promptSegment.prompt_text_en || ""}
              onChange={(e) => onChange(e.target.value, "en")}
              className="w-full h-80 bg-slate-900/30 text-slate-350 p-3 font-mono text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-luxury-500/40 resize-none border border-slate-800 rounded-lg block"
              placeholder="English optimized translation will appear here automatically. You can edit directly..."
            />
            <div className="absolute bottom-2 right-3 pointer-events-none text-[9px] text-slate-600 group-focus-within:text-luxury-500 flex items-center space-x-1 transition-colors">
              <Edit3 className="w-3 h-3" />
              <span>Chỉnh sửa trực tiếp</span>
            </div>
          </div>


        </div>

      </div>
    </div>
  );
}
