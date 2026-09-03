import React, { useState, useEffect } from "react";
import { TimelineItem } from "../types";
import { Volume2, Play, AlertCircle, Edit2, Check, X } from "lucide-react";

interface TimelineViewProps {
  timeline: TimelineItem[];
  selectedToneLabel: string;
  totalDuration: number;
  onPlayTTS: (text: string, onStateChange: (state: "idle" | "connecting" | "playing" | "error") => void) => void;
  onTimelineItemChange?: (index: number, action: string, dialogue: string) => void;
}

export default function TimelineView({ 
  timeline, 
  selectedToneLabel, 
  totalDuration, 
  onPlayTTS,
  onTimelineItemChange
}: TimelineViewProps) {
  return (
    <div id="timeline-view-container" className="space-y-6">
      {/* Header Info */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-luxury-950 to-indigo-950/40 border border-luxury-800/30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-luxury-500/15 flex items-center justify-center text-luxury-400">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold tracking-wider">PHONG CÁCH THOẠI ĐƯỢC CHỌN</p>
            <p className="text-sm font-bold text-white mb-0">{selectedToneLabel}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-slate-400 font-semibold tracking-wider">TỔNG THỜI LƯỢNG</p>
          <p className="text-sm font-bold text-luxury-400">{totalDuration} giây</p>
        </div>
      </div>

      {/* Timeline rendering */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Mốc phân cảnh thời gian (Nhấp sửa để đồng bộ sang prompt)
        </h4>
        <div className="space-y-4" id="timelineList">
          {timeline.map((item, index) => {
            return (
              <TimelineCard 
                key={index} 
                item={item} 
                index={index} 
                onPlayTTS={onPlayTTS} 
                onSave={(newAction, newDialogue) => {
                  if (onTimelineItemChange) {
                    onTimelineItemChange(index, newAction, newDialogue);
                  }
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface TimelineCardProps {
  key?: React.Key;
  item: TimelineItem;
  index: number;
  onPlayTTS: (text: string, onStateChange: (state: "idle" | "connecting" | "playing" | "error") => void) => void;
  onSave?: (action: string, dialogue: string) => void;
}

function TimelineCard({ item, index, onPlayTTS, onSave }: TimelineCardProps) {
  const [ttsState, setTtsState] = useState<"idle" | "connecting" | "playing" | "error">("idle");
  const [isEditing, setIsEditing] = useState(false);
  const [editAction, setEditAction] = useState(item.action);
  const [editDialogue, setEditDialogue] = useState(item.dialogue);

  // Keep state updated in case timeline changes from outside
  useEffect(() => {
    setEditAction(item.action);
    setEditDialogue(item.dialogue);
  }, [item]);

  const handlePlay = () => {
    onPlayTTS(item.dialogue, (newState) => {
      setTtsState(newState);
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editAction, editDialogue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditAction(item.action);
    setEditDialogue(item.dialogue);
    setIsEditing(false);
  };

  const getButtonContent = () => {
    switch (ttsState) {
      case "connecting":
        return (
          <>
            <svg className="animate-spin h-3 w-3 text-white inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Đang nối...</span>
          </>
        );
      case "playing":
        return (
          <>
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping mr-1"></span>
            <span className="text-emerald-400">Đang phát...</span>
          </>
        );
      case "error":
        return (
          <>
            <AlertCircle className="w-3 h-3 text-rose-500 mr-1" />
            <span className="text-rose-500">Lỗi kết nối</span>
          </>
        );
      default:
        return (
          <>
            <Play className="w-3 h-3 text-luxury-400 mr-1 fill-luxury-400" />
            <span>Nghe thử AI Voice</span>
          </>
        );
    }
  };

  return (
    <div className="relative pl-8 pb-6 border-l border-slate-800 last:border-0 last:pb-0 group">
      {/* Circle bullet index */}
      <div className="absolute -left-[9px] top-1.5 w-[18px] h-[18px] rounded-full bg-slate-950 border-2 border-luxury-500 flex items-center justify-center text-[9px] font-bold text-white group-hover:scale-110 transition-transform">
        {index + 1}
      </div>

      {/* Card Header tag */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <div className="flex items-center space-x-2">
          <span className="inline-block px-2.5 py-0.5 rounded-md bg-luxury-950 text-luxury-400 font-mono text-xs font-bold border border-luxury-900/40">
            {item.time}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-2 py-1 rounded bg-slate-800/85 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center space-x-1 cursor-pointer"
              title="Chỉnh sửa kịch bản"
            >
              <Edit2 className="w-3.5 h-3.5 text-luxury-400" />
              <span>Sửa</span>
            </button>
          )}

          <button
            onClick={handlePlay}
            disabled={ttsState === "connecting" || ttsState === "playing" || isEditing}
            className={`px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center transition-all cursor-pointer ${
              ttsState === "playing" ? "ring-1 ring-emerald-500/40" : ""
            } ${isEditing ? "opacity-30 cursor-not-allowed" : ""}`}
          >
            {getButtonContent()}
          </button>
        </div>
      </div>

      {/* Main Content card */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/60 hover:border-slate-700/60 transition-all space-y-3">
        {isEditing ? (
          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Hành động
              </label>
              <textarea
                value={editAction}
                onChange={(e) => setEditAction(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 p-2 text-xs text-slate-100 rounded-lg focus:outline-none focus:border-luxury-500 focus:ring-1 focus:ring-luxury-500 transition-all font-sans resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Lời thoại
              </label>
              <input
                type="text"
                value={editDialogue}
                onChange={(e) => setEditDialogue(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-100 rounded-lg focus:outline-none focus:border-luxury-500 focus:ring-1 focus:ring-luxury-500 transition-all font-sans"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-1 border-t border-slate-900">
              <button
                type="button"
                onClick={handleCancel}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Hủy</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-2.5 py-1 rounded bg-gradient-to-r from-luxury-600 to-indigo-600 hover:from-luxury-500 hover:to-indigo-500 text-white text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-all shadow"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Đồng bộ</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-300">Hành động:</strong> {item.action}
            </div>
            <div className="text-xs text-luxury-300 italic font-medium bg-luxury-950/20 p-2.5 rounded border border-luxury-950/40 leading-relaxed">
              <strong className="text-slate-350 not-italic mr-1.5 font-bold">Thoại:</strong> "{item.dialogue}"
            </div>
          </>
        )}
      </div>
    </div>
  );
}
