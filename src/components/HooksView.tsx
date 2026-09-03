import React, { useState } from "react";
import { HookSuggestion } from "../types";
import { Flame, Copy, Check, Hash, Sparkles, Share2 } from "lucide-react";

interface HooksViewProps {
  hooks?: HookSuggestion[];
  onCopyAllHooks?: () => void;
}

export default function HooksView({ hooks = [] }: HooksViewProps) {
  const [copiedIndex, setCopiedIndex] = useState<{ idx: number; type: "all" | "title" | "hashtags" } | null>(null);
  const [copiedAllBatch, setCopiedAllBatch] = useState(false);

  const handleCopyText = (text: string, idx: number, type: "all" | "title" | "hashtags") => {
    navigator.clipboard.writeText(text);
    setCopiedIndex({ idx, type });
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const handleCopyAll5 = () => {
    if (!hooks.length) return;
    let fullText = "🔥 TOP 5 GỢI Ý TIÊU ĐỀ HOOK & HASHTAG VIDEO XU HƯỚNG:\n\n";
    hooks.forEach((h, i) => {
      fullText += `${i + 1}. ${h.title}\n   Hashtag: ${h.hashtags.join(" ")}\n\n`;
    });
    navigator.clipboard.writeText(fullText.trim());
    setCopiedAllBatch(true);
    setTimeout(() => setCopiedAllBatch(false), 2000);
  };

  if (!hooks || hooks.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
        <Sparkles className="w-8 h-8 text-luxury-400 mx-auto mb-2 opacity-50" />
        <p className="text-xs text-slate-400">Chưa có gợi ý tiêu đề Hook. Hãy bấm tạo kịch bản để sinh 5 tiêu đề cuốn hút kèm hashtag!</p>
      </div>
    );
  }

  return (
    <div id="hooks-view-container" className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <span>5 TIÊU ĐỀ HOOK GIẬT TÍT &amp; HASHTAG XU HƯỚNG</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tối ưu 3 giây đầu giữ chân người xem và đề xuất thuật toán TikTok / Reels / Shorts
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyAll5}
          className="flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-750 text-luxury-300 hover:text-luxury-200 border border-luxury-500/30 font-bold text-xs py-2 px-3.5 rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-95"
        >
          {copiedAllBatch ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Đã copy 5 Hooks!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-luxury-400" />
              <span>Copy toàn bộ 5 Hooks</span>
            </>
          )}
        </button>
      </div>

      {/* 5 Hook Cards */}
      <div className="space-y-3" id="hookCardsList">
        {hooks.map((item, idx) => {
          const isCopiedTitle = copiedIndex?.idx === idx && copiedIndex.type === "title";
          const isCopiedTags = copiedIndex?.idx === idx && copiedIndex.type === "hashtags";
          const isCopiedAll = copiedIndex?.idx === idx && copiedIndex.type === "all";

          return (
            <div
              key={idx}
              className="bg-slate-950/80 border border-slate-800/90 hover:border-luxury-500/50 rounded-xl p-4 transition-all duration-200 hover:shadow-lg relative group"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Number badge & Hook Content */}
                <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-luxury-700 to-rose-600 text-white text-[11px] font-bold font-mono flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    0{idx + 1}
                  </div>

                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Hook Title */}
                    <p className="text-sm font-semibold text-slate-100 leading-snug group-hover:text-luxury-200 transition-colors">
                      {item.title}
                    </p>

                    {/* Hashtags list */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {item.hashtags.map((tag, tagIdx) => (
                        <button
                          key={tagIdx}
                          type="button"
                          onClick={() => handleCopyText(tag, idx, "hashtags")}
                          title="Nhấp để copy hashtag này"
                          className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-indigo-950/60 hover:bg-indigo-900/70 border border-indigo-800/40 text-[11px] font-mono font-medium text-indigo-300 hover:text-indigo-100 transition-all cursor-pointer"
                        >
                          <Hash className="w-2.5 h-2.5 opacity-60" />
                          <span>{tag.replace(/^#/, "")}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick copy buttons */}
                <div className="flex items-center space-x-1.5 shrink-0 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleCopyText(item.title, idx, "title")}
                    title="Copy chỉ tiêu đề Hook"
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all cursor-pointer text-xs"
                  >
                    {isCopiedTitle ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyText(item.hashtags.join(" "), idx, "hashtags")}
                    title="Copy 3 hashtag"
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-200 border border-slate-800 transition-all cursor-pointer text-xs"
                  >
                    {isCopiedTags ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Hash className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyText(`${item.title}\n${item.hashtags.join(" ")}`, idx, "all")}
                    className="px-2.5 py-1.5 rounded-lg bg-luxury-950/70 hover:bg-luxury-900 text-luxury-300 hover:text-luxury-100 border border-luxury-800/50 transition-all cursor-pointer text-[11px] font-semibold flex items-center space-x-1"
                  >
                    {isCopiedAll ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Đã copy</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3 h-3" />
                        <span>Copy cả 2</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
