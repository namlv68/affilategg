/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Settings, 
  Play, 
  Pause,
  Loader2,
  HelpCircle, 
  FileText, 
  Terminal, 
  Flame,
  Copy, 
  History, 
  Plus, 
  Minus, 
  AlertCircle,
  Eye,
  EyeOff,
  Clipboard,
  Check,
  ChevronDown,
  Key,
  X,
  Shirt,
  UtensilsCrossed
} from "lucide-react";
import QuickTemplates from "./components/QuickTemplates";
import ToneConfig, { toneOptions } from "./components/ToneConfig";
import StyleConfig, { fashionStyleOptions } from "./components/StyleConfig";
import ApplianceConfig, { applianceHoldingOptions, applianceContextOptions } from "./components/ApplianceConfig";
import TimelineView from "./components/TimelineView";
import PromptsView from "./components/PromptsView";
import HooksView from "./components/HooksView";
import { GeneratedResult, HistoryItem, AppModule, ApplianceHoldingStyle } from "./types";
import { safeFetchJson } from "./lib/api";

export default function App() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Active module state (fashion vs appliances)
  const [currentModule, setCurrentModule] = useState<AppModule>(() => {
    return (localStorage.getItem("fc_currentModule") as AppModule) ?? "fashion";
  });

  // Input states with local storage persistence
  const [highlights, setHighlights] = useState<string>(() => {
    return localStorage.getItem("fc_highlights") ?? "Đầm lụa satin thiết kế cao cấp màu xanh emerald tôn dáng. Form đứng dáng cực kỳ sang chảnh, chất vải lụa tơ tằm mềm mại mát lịm, mặc cực kỳ thoải mái và dễ phối với phụ kiện ánh vàng gold.";
  });
  const [duration, setDuration] = useState<number>(() => {
    const v = localStorage.getItem("fc_duration");
    return v ? parseInt(v, 10) : 10;
  });
  const [selectedToneId, setSelectedToneId] = useState<string>(() => {
    return localStorage.getItem("fc_selectedToneId") ?? "casual";
  });
  const [selectedStyleId, setSelectedStyleId] = useState<string>(() => {
    return localStorage.getItem("fc_selectedStyleId") ?? "product_commercial";
  });
  const [applianceHoldingStyle, setApplianceHoldingStyle] = useState<ApplianceHoldingStyle>(() => {
    return (localStorage.getItem("fc_applianceHoldingStyle") as ApplianceHoldingStyle) ?? "hand_hold";
  });
  const [applianceContextId, setApplianceContextId] = useState<string>(() => {
    return localStorage.getItem("fc_applianceContextId") ?? "kitchen_modern";
  });
  const [cta, setCta] = useState<string>(() => {
    return localStorage.getItem("fc_cta") ?? "";
  });

  // UI state
  const [activeTab, setActiveTab] = useState<"script" | "prompts" | "hooks">("script");
  const [loading, setLoading] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [loadingElapsed, setLoadingElapsed] = useState<number>(0);
  const [loadingStep, setLoadingStep] = useState<string>("Đang khởi tạo ý tưởng...");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Result state with local storage persistence
  const [result, setResult] = useState<GeneratedResult | null>(() => {
    try {
      const v = localStorage.getItem("fc_result");
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // API Key state
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return localStorage.getItem("fc_customApiKey") ?? "";
  });

  // Manage API key modal state
  const [isKeyManagerOpen, setIsKeyManagerOpen] = useState<boolean>(false);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>(() => {
    return localStorage.getItem("fc_customApiKey") ?? "";
  });

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setTempApiKey(text.trim());
        showToast("Đã dán API KEY từ bộ nhớ tạm!", "success");
      } else {
        showToast("Bộ nhớ tạm trống. Vui lòng copy API Key trước khi dán.", "error");
      }
    } catch {
      showToast("Vui lòng nhấn chuột phải hoặc dùng Ctrl+V để dán trực tiếp vào ô.", "error");
    }
  };

  // Loading timer & status steps
  useEffect(() => {
    let timer: any = null;
    if (loading && !isPaused) {
      timer = setInterval(() => {
        setLoadingElapsed((prev) => {
          const next = prev + 1;
          if (next <= 2) {
            setLoadingStep("Đang phân tích sản phẩm & định hình góc nhìn độc đáo...");
          } else if (next <= 5) {
            setLoadingStep("Đang sáng tạo lời thoại mở đầu & cảm xúc...");
          } else if (next <= 8) {
            setLoadingStep("Đang phân bổ nhịp timeline 3s & hành động nhân vật...");
          } else if (next <= 12) {
            setLoadingStep("Đang tối ưu prompt AI Video 10s (VI/EN)...");
          } else {
            setLoadingStep("Đang hoàn thiện & xuất bản dữ liệu kịch bản...");
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [loading, isPaused]);

  // Toast effect
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("fashion_creator_history_react");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save current states to localStorage to preserve last action on reload
  useEffect(() => {
    localStorage.setItem("fc_currentModule", currentModule);
  }, [currentModule]);

  useEffect(() => {
    localStorage.setItem("fc_highlights", highlights);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [highlights]);

  useEffect(() => {
    localStorage.setItem("fc_duration", duration.toString());
  }, [duration]);

  useEffect(() => {
    localStorage.setItem("fc_selectedToneId", selectedToneId);
  }, [selectedToneId]);

  useEffect(() => {
    localStorage.setItem("fc_selectedStyleId", selectedStyleId);
  }, [selectedStyleId]);

  useEffect(() => {
    localStorage.setItem("fc_applianceHoldingStyle", applianceHoldingStyle);
  }, [applianceHoldingStyle]);

  useEffect(() => {
    localStorage.setItem("fc_applianceContextId", applianceContextId);
  }, [applianceContextId]);

  useEffect(() => {
    localStorage.setItem("fc_cta", cta);
  }, [cta]);

  useEffect(() => {
    if (result) {
      localStorage.setItem("fc_result", JSON.stringify(result));
    } else {
      localStorage.removeItem("fc_result");
    }
  }, [result]);

  useEffect(() => {
    localStorage.setItem("fc_customApiKey", customApiKey);
  }, [customApiKey]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  const handleSwitchModule = (mod: AppModule) => {
    if (mod !== currentModule) {
      setCurrentModule(mod);
      setResult(null); // Clear previous generated content when switching module
      
      // Update with default sample if appropriate
      if (mod === "appliances") {
        setHighlights("Nồi chiên không dầu điện tử 6.5L lòng nồi phủ ceramic chống dính cao cấp. Mặt trước có kính cường lực trong suốt dễ quan sát thức ăn chín vàng, bảng điều khiển cảm ứng LED 8 chế độ nấu tự động, công nghệ nhiệt đối lưu Rapid Air giảm 85% mỡ thừa, tay cầm cách nhiệt chống bỏng an toàn tuyệt đối.");
        showToast("Đã chuyển sang module AI HÀNG GIA DỤNG", "success");
      } else {
        setHighlights("Đầm lụa satin thiết kế cao cấp màu xanh emerald tôn dáng. Form đứng dáng cực kỳ sang chảnh, chất vải lụa tơ tằm mềm mại mát lịm, mặc cực kỳ thoải mái và dễ phối với phụ kiện ánh vàng gold.");
        setSelectedStyleId("product_commercial");
        showToast("Đã chuyển sang module AI THỜI TRANG", "success");
      }
    }
  };

  const handleAdjustDuration = (amount: number) => {
    setDuration((prev) => {
      let next = prev + amount;
      if (next < 10) next = 10;
      if (next > 60) next = 60;
      return next;
    });
  };

  const handleSelectStyle = (id: string) => {
    if (id !== selectedStyleId) {
      setSelectedStyleId(id);
      setResult(null); // Clear previous generated script and prompts when style changes
      showToast("Đã đổi phong cách và xóa kịch bản cũ!", "success");
    }
  };

  const handleSelectApplianceHoldingStyle = (st: ApplianceHoldingStyle) => {
    if (st !== applianceHoldingStyle) {
      setApplianceHoldingStyle(st);
      setResult(null);
      showToast(st === "hand_hold" ? "Đã chọn: Cầm sản phẩm trên tay và nói" : "Đã chọn: Đặt sản phẩm tại bàn và nói", "success");
    }
  };

  const handleSelectApplianceContext = (ctxId: string) => {
    if (ctxId !== applianceContextId) {
      setApplianceContextId(ctxId);
      setResult(null);
      showToast("Đã chọn bối cảnh không gian quay mới!", "success");
    }
  };

  const handleSelectTemplate = (text: string) => {
    setHighlights(text);
    showToast("Đã nhập nội dung mẫu thành công!");
  };

  const addToHistory = (
    rawHighlights: string, 
    toneName: string, 
    dur: number, 
    resData: GeneratedResult, 
    customCta?: string, 
    moduleUsed?: AppModule,
    appHolding?: ApplianceHoldingStyle,
    appContext?: string
  ) => {
    const snippet = rawHighlights.length > 20 ? rawHighlights.substring(0, 18) + "..." : rawHighlights;
    const newItem: HistoryItem = {
      id: Date.now(),
      snippet,
      tone: toneName,
      duration: dur,
      rawFullHighlights: rawHighlights,
      cta: customCta,
      module: moduleUsed || currentModule,
      applianceHoldingStyle: appHolding,
      applianceContextId: appContext,
      resultData: resData
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, 5); // store up to 5
      try {
        localStorage.setItem("fashion_creator_history_react", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleApplyHistory = (item: HistoryItem) => {
    if (item.module && item.module !== currentModule) {
      setCurrentModule(item.module);
    }
    setHighlights(item.rawFullHighlights);
    setDuration(item.duration);
    if (item.cta !== undefined) {
      setCta(item.cta);
    }
    if (item.applianceHoldingStyle) {
      setApplianceHoldingStyle(item.applianceHoldingStyle);
    }
    if (item.applianceContextId) {
      setApplianceContextId(item.applianceContextId);
    }
    
    const matchedTone = toneOptions.find(t => t.name === item.tone);
    if (matchedTone) setSelectedToneId(matchedTone.id);

    if (item.resultData) {
      setResult(item.resultData);
    }
    showToast("Đã khôi phục dữ liệu từ lịch sử!");
  };

  // Convert base64 sound to standard Audio WAV
  const base64ToArrayBuffer = (base64: string) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const pcmToWav = (pcm16: Int16Array, sampleRate: number) => {
    const buffer = new ArrayBuffer(44 + pcm16.length * 2);
    const view = new DataView(buffer);

    // RIFF Chunk
    view.setUint8(0, 'R'.charCodeAt(0));
    view.setUint8(1, 'I'.charCodeAt(0));
    view.setUint8(2, 'F'.charCodeAt(0));
    view.setUint8(3, 'F'.charCodeAt(0));
    view.setUint32(4, 36 + pcm16.length * 2, true);
    // WAVE Header
    view.setUint8(8, 'W'.charCodeAt(0));
    view.setUint8(9, 'A'.charCodeAt(0));
    view.setUint8(10, 'V'.charCodeAt(0));
    view.setUint8(11, 'E'.charCodeAt(0));
    // fmt Chunk
    view.setUint8(12, 'f'.charCodeAt(0));
    view.setUint8(13, 'm'.charCodeAt(0));
    view.setUint8(14, 't'.charCodeAt(0));
    view.setUint8(15, ' '.charCodeAt(0));
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM Format
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // ByteRate
    view.setUint16(32, 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample
    // data Chunk
    view.setUint8(36, 'd'.charCodeAt(0));
    view.setUint8(37, 'a'.charCodeAt(0));
    view.setUint8(38, 't'.charCodeAt(0));
    view.setUint8(39, 'a'.charCodeAt(0));
    view.setUint32(40, pcm16.length * 2, true);

    for (let i = 0; i < pcm16.length; i++) {
      view.setInt16(44 + i * 2, pcm16[i], true);
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  const handlePlayTTS = async (text: string, onStateChange: (state: "idle" | "connecting" | "playing" | "error") => void) => {
    if (!customApiKey || !customApiKey.trim()) {
      setTempApiKey(customApiKey);
      setIsKeyManagerOpen(true);
      showToast("Vui lòng dán Gemini API KEY để sử dụng tính năng đọc thoại!", "error");
      onStateChange("error");
      setTimeout(() => onStateChange("idle"), 2000);
      return;
    }

    onStateChange("connecting");
    const matchedTone = toneOptions.find(t => t.id === selectedToneId);
    
    try {
      const resJson = await safeFetchJson<{ audioData?: string; mimeType?: string }>("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          tone: matchedTone ? matchedTone.name : "Giản dị",
          customApiKey: customApiKey
        })
      });

      if (resJson.audioData) {
        const sampleRate = 24000; // default for Gemini flash preview tts
        const rawBuffer = base64ToArrayBuffer(resJson.audioData);
        const pcm16 = new Int16Array(rawBuffer);
        const wavBlob = pcmToWav(pcm16, sampleRate);
        const audioUrl = URL.createObjectURL(wavBlob);

        const audio = new Audio(audioUrl);
        onStateChange("playing");
        audio.play();
        audio.onended = () => {
          onStateChange("idle");
        };
      } else {
        throw new Error("Không thể chuyển đổi âm thanh.");
      }
    } catch (e: any) {
      console.error(e);
      showToast(e?.message || "Lỗi tạo giọng nói nhân tạo", "error");
      onStateChange("error");
      setTimeout(() => onStateChange("idle"), 2500);
    }
  };

  // Pause / Resume and Cancel handlers
  const handleTogglePause = () => {
    setIsPaused((prev) => {
      const nextState = !prev;
      showToast(nextState ? "Đã tạm dừng quá trình tạo kịch bản" : "Đang tiếp tục tạo kịch bản...", "success");
      return nextState;
    });
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
    setIsPaused(false);
    setLoadingElapsed(0);
    showToast("Đã hủy bỏ quá trình tạo kịch bản!", "error");
  };

  // Main Generator submit
  const handleGenerate = async () => {
    if (!customApiKey || !customApiKey.trim()) {
      setTempApiKey(customApiKey);
      setIsKeyManagerOpen(true);
      showToast("Vui lòng dán Gemini API KEY để kích hoạt các tác vụ AI!", "error");
      return;
    }

    if (!highlights.trim()) {
      showToast(`Vui lòng điền thông tin điểm nổi bật của sản phẩm ${currentModule === "appliances" ? "gia dụng" : "thời trang"}!`, "error");
      return;
    }

    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setIsPaused(false);
    setLoadingElapsed(0);
    setLoadingStep("Đang phân tích sản phẩm & định hình góc nhìn độc đáo...");

    try {
      const matchedTone = toneOptions.find(t => t.id === selectedToneId);
      let styleName = "";
      let stylePrompt = "";

      if (currentModule === "appliances") {
        const matchedContext = applianceContextOptions.find(c => c.id === applianceContextId) || applianceContextOptions[0];
        styleName = matchedContext ? matchedContext.name : "Gian bếp hiện đại cao cấp";
        stylePrompt = matchedContext ? matchedContext.promptText : "";
      } else {
        const matchedStyle = fashionStyleOptions.find(s => s.id === selectedStyleId) || fashionStyleOptions[0];
        styleName = matchedStyle ? matchedStyle.name : "Showroom Thời Trang Cao Cấp";
        stylePrompt = matchedStyle ? matchedStyle.promptText : "";
      }

      const dataResult = await safeFetchJson<GeneratedResult>("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          module: currentModule,
          highlights: highlights.trim(),
          duration: duration,
          tone: matchedTone ? matchedTone.name : "Giản dị",
          style: styleName,
          stylePrompt: stylePrompt,
          selectedStyleId: currentModule === "fashion" ? selectedStyleId : undefined,
          holdingStyle: applianceHoldingStyle,
          cta: cta.trim(),
          customApiKey: customApiKey
        })
      });

      setResult(dataResult);
      setActiveTab("script");
      showToast(`Tạo kịch bản và prompt AI ${currentModule === "appliances" ? "Hàng Gia Dụng" : "Thời Trang"} thành công!`);
      
      // Save history log
      addToHistory(
        highlights.trim(),
        matchedTone ? matchedTone.name : "Giản dị",
        duration,
        dataResult,
        cta.trim(),
        currentModule,
        applianceHoldingStyle,
        applianceContextId
      );

    } catch (err: any) {
      if (err?.name === "AbortError") {
        console.log("Generation aborted by user");
        return;
      }
      console.error(err);
      showToast(err?.message || "Đã xảy ra lỗi khi tạo kịch bản từ Gemini.", "error");
    } finally {
      setLoading(false);
      setIsPaused(false);
    }
  };

  const handleCopyAll = () => {
    if (!result) return;
    let textToCopy = "";

    if (activeTab === "script") {
      textToCopy = result.timeline
        .map((item, idx) => `Phân đoạn ${idx + 1} (${item.time}):\nHành động: ${item.action}\nThoại: "${item.dialogue}"`)
        .join("\n\n");
    } else if (activeTab === "prompts") {
      textToCopy = result.prompts
        .map((p, idx) => `=== ${p.segment || `Phân cảnh ${idx + 1}`} ===\n${p.prompt_text}`)
        .join("\n\n\n");
    } else if (activeTab === "hooks") {
      if (result.hooks && result.hooks.length > 0) {
        textToCopy = result.hooks
          .map((h, idx) => `${idx + 1}. ${h.title}\n   Hashtag: ${h.hashtags.join(" ")}`)
          .join("\n\n");
      }
    }

    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = textToCopy;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextArea);

    showToast("Đã copy toàn bộ nội dung của tab hiện tại!");
  };

  const handlePromptTextChange = (index: number, newText: string, lang: "vi" | "en" = "vi") => {
    if (!result) return;
    const updatedPrompts = [...result.prompts];
    if (lang === "vi") {
      updatedPrompts[index] = { ...updatedPrompts[index], prompt_text: newText };
    } else {
      updatedPrompts[index] = { ...updatedPrompts[index], prompt_text_en: newText };
    }
    setResult({ ...result, prompts: updatedPrompts });
  };

  const handleTimelineItemChange = (index: number, newAction: string, newDialogue: string) => {
    if (!result) return;

    // 1. Update the timeline item
    const updatedTimeline = [...result.timeline];
    const item = { ...updatedTimeline[index], action: newAction, dialogue: newDialogue };
    updatedTimeline[index] = item;

    // 2. Synchronize to corresponding prompt segment
    const promptIndex = Math.floor(index / 3);
    const subIndex = index % 3;

    const updatedPrompts = [...result.prompts];
    if (updatedPrompts[promptIndex]) {
      const promptText = updatedPrompts[promptIndex].prompt_text;
      const lines = promptText.split("\n");
      const relativeTime = ["0s - 3s", "3s - 6s", "6s - 10s"][subIndex];

      const targetPrefix1 = `- ${item.time}:`;
      const targetPrefix2 = `- ${relativeTime}:`;

      const updatedLines = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith(targetPrefix1) || trimmed.startsWith(targetPrefix2)) {
          const leadingWhitespace = line.match(/^\s*/)?.[0] || "";
          const timePart = trimmed.startsWith(targetPrefix1) ? item.time : relativeTime;
          return `${leadingWhitespace}- ${timePart}: ${newAction}. Lời thoại tiếng Việt: "${newDialogue}"`;
        }
        return line;
      });

      updatedPrompts[promptIndex] = {
        ...updatedPrompts[promptIndex],
        prompt_text: updatedLines.join("\n")
      };
    }

    setResult({
      ...result,
      timeline: updatedTimeline,
      prompts: updatedPrompts
    });

    showToast("Đã lưu kịch bản và đồng bộ sang Prompt AI Video thành công!", "success");
  };

  const activeToneLabel = toneOptions.find(t => t.id === selectedToneId)?.name || "Giản dị";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-luxury-500 selection:text-white relative">

      {/* HEADER */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-luxury-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-luxury-900/40">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-luxury-300 via-rose-300 to-indigo-300 bg-clip-text text-transparent leading-none">
                NAM AI STUDIO
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">
                {currentModule === "appliances" ? "MODULE AI HÀNG GIA DỤNG" : "MODULE AI THỜI TRANG"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => {
                setTempApiKey(customApiKey);
                setShowApiKey(false);
                setIsKeyManagerOpen(true);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer border ${
                customApiKey 
                  ? "bg-emerald-950/40 border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/40" 
                  : "bg-rose-950/50 border-rose-800/60 text-rose-300 hover:bg-rose-900/50 shadow-sm"
              }`}
            >
              <Key className={`w-3.5 h-3.5 ${customApiKey ? "text-emerald-400" : "text-rose-400"}`} />
              <span>{customApiKey ? "API KEY: Đã cài đặt" : "Cấu hình API KEY (Bắt buộc)"}</span>
              <span className={`w-2 h-2 rounded-full ${customApiKey ? "bg-emerald-400 animate-pulse" : "bg-rose-500 animate-ping"}`}></span>
            </button>

            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-luxury-950 text-luxury-300 border border-luxury-800/50">
              <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              📞 Hỗ trợ: Nam 098.102.8794
            </span>
          </div>
        </div>
      </header>

      {/* TOAST SYSTEM */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] bg-gradient-to-r from-luxury-800 to-indigo-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg border border-luxury-600/30 flex items-center space-x-1.5 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* MODULE SELECTOR TABS */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 border border-slate-800/90 p-2.5 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="flex items-center space-x-2 px-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chọn Module AI:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            <button
              type="button"
              id="module-fashion-btn"
              onClick={() => handleSwitchModule("fashion")}
              className={`flex items-center justify-center space-x-2 py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                currentModule === "fashion"
                  ? "bg-gradient-to-r from-luxury-600 to-rose-600 text-white shadow-lg shadow-luxury-600/30 border border-luxury-400/40"
                  : "bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800/70 hover:bg-slate-900"
              }`}
            >
              <Shirt className="w-4 h-4" />
              <span>👗 AI THỜI TRANG</span>
            </button>

            <button
              type="button"
              id="module-appliances-btn"
              onClick={() => handleSwitchModule("appliances")}
              className={`flex items-center justify-center space-x-2 py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                currentModule === "appliances"
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-orange-600/30 border border-orange-400/40"
                  : "bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800/70 hover:bg-slate-900"
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>🍳 AI HÀNG GIA DỤNG</span>
            </button>
          </div>
        </div>

        {/* INTRO HERO */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-luxury-950/40 border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-luxury-600/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl -z-10"></div>
          
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-luxury-400 uppercase tracking-widest bg-luxury-950/80 px-3 py-1 rounded-full border border-luxury-900/30">
              {currentModule === "appliances" ? "Hệ thống AI Hàng Gia Dụng (Cầm Trên Tay & Nói)" : "Hệ thống AI Video Thời Trang"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
              {currentModule === "appliances" 
                ? "Tạo Prompt AI Hàng Gia Dụng - Cầm Trên Tay & Review" 
                : "Tạo Prompt Video Thời Trang Đỉnh Cao Cho AI"}
            </h2>
            <p className="text-slate-400 mt-2 text-sm sm:text-base leading-relaxed">
              {currentModule === "appliances"
                ? "Nhập thông tin sản phẩm gia dụng, đồ bếp, thiết bị thông minh. AI sẽ tự động phân tích tính năng và thiết kế kịch bản với hành động cốt lõi: Nhân vật cầm sản phẩm trên tay, thao tác trực tiếp và nói chuyện tự nhiên trước máy quay."
                : "Nhập thông tin chi tiết về sản phẩm thời trang cần làm video, hệ thống AI sẽ tự động phân tích đặc trưng, nhận diện sản phẩm và chia mốc kịch bản hoàn hảo kèm Prompt tối ưu nhất."}
            </p>
          </div>
          
          <QuickTemplates module={currentModule} onSelect={handleSelectTemplate} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: WORKSPACE CONFIGURATION */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-luxury-400" />
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">Cấu hình video</h3>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  currentModule === "appliances"
                    ? "bg-amber-950 text-amber-300 border-amber-800"
                    : "bg-luxury-950 text-luxury-300 border-luxury-800"
                }`}>
                  {currentModule === "appliances" ? "Gia dụng (Cầm trên tay)" : "Thời trang (Mặc đồ)"}
                </span>
              </div>

              {/* Product detailed input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-350 mb-2">
                  Thông tin &amp; Điểm nổi bật của sản phẩm <span className="text-rose-500">*</span>
                </label>
                <textarea
                  ref={textareaRef}
                  id="highlightsInput"
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-luxury-500 focus:ring-1 focus:ring-luxury-500 transition-all placeholder:text-slate-600 overflow-hidden resize-none min-h-[140px] leading-relaxed"
                  placeholder={currentModule === "appliances"
                    ? "Ví dụ: Nồi chiên không dầu 6.5L lòng ceramic chống dính, cửa kính trong suốt quan sát chín vàng, cảm ứng LED 8 chế độ..."
                    : "Ví dụ: Đầm lụa tơ tằm mềm mại mát lịm, dáng xòe dài thanh nhã dạo phố quý phái..."}
                />
              </div>

              {/* Video Timeline Duration slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Tổng thời lượng video
                  </label>
                  <span id="durationDisplay" className="text-sm font-extrabold text-luxury-400 bg-luxury-950/60 px-2.5 py-0.5 rounded-full border border-luxury-800/40">
                    {duration}s
                  </span>
                </div>
                <div className="flex items-center space-x-3 bg-slate-950/50 p-2 rounded-xl border border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleAdjustDuration(-10)}
                    className="w-10 h-10 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-200 hover:text-white active:scale-95 transition-all cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex-grow text-center text-xs font-medium text-slate-400">
                    Nhấp tăng/giảm mốc 10s
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAdjustDuration(10)}
                    className="w-10 h-10 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-200 hover:text-white active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Speech Tone */}
              <ToneConfig 
                selectedToneId={selectedToneId} 
                onSelectTone={setSelectedToneId} 
              />

              {/* Module-specific Style & Interaction Configuration */}
              {currentModule === "appliances" ? (
                <ApplianceConfig
                  holdingStyle={applianceHoldingStyle}
                  onSelectHoldingStyle={handleSelectApplianceHoldingStyle}
                  contextId={applianceContextId}
                  onSelectContext={handleSelectApplianceContext}
                />
              ) : (
                <StyleConfig 
                  module="fashion"
                  selectedStyleId={selectedStyleId} 
                  onSelectStyle={handleSelectStyle} 
                />
              )}

              {/* Call-to-action (CTA) optional config */}
              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="ctaInput" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Kêu gọi hành động (CTA) cuối video
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                    Tùy chọn
                  </span>
                </div>
                <input
                  type="text"
                  id="ctaInput"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 focus:outline-none focus:border-luxury-500 focus:ring-1 focus:ring-luxury-500 transition-all placeholder:text-slate-600"
                  placeholder={currentModule === "appliances" ? "VD: Bấm góc trái rước em máy tiện lợi này về gian bếp nha! (Để trống AI tự tạo)" : "VD: Bấm ngay góc trái rước em nó về tủ đồ nha! (Để trống AI tự tạo)"}
                />
                <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
                  💡 <em>Để trống:</em> AI sẽ tự động sáng tạo câu kêu gọi ngắn gọn, đủ ý, duyên dáng và chuẩn từ ngữ nền tảng.
                </p>
              </div>

              {/* ACTION GENERATE SPARKS */}
              <div className="pt-4 space-y-2">
                {!customApiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setTempApiKey(customApiKey);
                      setShowApiKey(false);
                      setIsKeyManagerOpen(true);
                    }}
                    className="w-full text-center text-xs text-amber-300 bg-amber-950/40 hover:bg-amber-950/60 border border-amber-800/50 rounded-xl py-2 px-3 flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>Chưa có API KEY. Bấm vào đây để dán API KEY và kích hoạt AI</span>
                  </button>
                )}

                <button
                  type="button"
                  id="btnGenerate"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full glow-btn bg-gradient-to-r from-luxury-600 via-rose-600 to-indigo-600 hover:from-luxury-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-[0.98] cursor-pointer disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline font-bold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Đang suy luận kịch bản...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>{currentModule === "appliances" ? "Tạo Kịch Bản Gia Dụng & Prompt AI" : "Tạo Kịch Bản & Prompt AI"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT: TIMELINE AND RESULT VIEWER */}
          <section className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm min-h-[500px] flex flex-col justify-between">
              <div>
                
                {/* Visual tabs switcher */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
                    <button
                      id="btnScriptTab"
                      onClick={() => setActiveTab("script")}
                      className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer ${
                        activeTab === "script"
                          ? "bg-luxury-600 text-white shadow-md font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Kịch bản phân cảnh</span>
                    </button>
                    <button
                      id="btnPromptTab"
                      onClick={() => setActiveTab("prompts")}
                      className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer ${
                        activeTab === "prompts"
                          ? "bg-luxury-600 text-white shadow-md font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Prompt AI Video</span>
                      {result?.prompts && (
                        <span id="promptCountBadge" className="ml-1 px-1.5 py-0.5 text-[10px] bg-indigo-600 text-white rounded-full font-mono">
                          {result.prompts.length}
                        </span>
                      )}
                    </button>
                    <button
                      id="btnHooksTab"
                      onClick={() => setActiveTab("hooks")}
                      className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer ${
                        activeTab === "hooks"
                          ? "bg-gradient-to-r from-rose-600 to-luxury-600 text-white shadow-md font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      <span>5 Tiêu đề Hook</span>
                      {result?.hooks && result.hooks.length > 0 && (
                        <span id="hooksCountBadge" className="ml-1 px-1.5 py-0.5 text-[10px] bg-rose-600 text-white rounded-full font-mono">
                          {result.hooks.length}
                        </span>
                      )}
                    </button>
                  </div>
                  
                  {result && (
                    <button
                      id="copyBtn"
                      onClick={handleCopyAll}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy tất cả</span>
                    </button>
                  )}
                </div>

                {/* TAB DISPLAY WORKSPACE */}
                {loading && (
                  <div id="outputLoading" className="py-16 text-center space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-t-luxury-500 animate-spin"></div>
                    </div>
                    <div className="max-w-md mx-auto">
                      <h4 className="text-sm font-bold text-slate-200 animate-pulse">Gemini AI đang sáng tạo nội dung...</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Quá trình sinh kịch bản thoại với phong cách bối cảnh và đo lường thời lượng cực kỳ chính xác mất khoảng vài giây.
                      </p>
                    </div>
                  </div>
                )}

                {!loading && !result && (
                  <div id="outputPlaceholder" className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-850 flex items-center justify-center mx-auto border border-slate-800 text-slate-600">
                      <Eye className="w-6 h-6" />
                    </div>
                    <div className="max-w-md mx-auto">
                      <h4 className="text-sm font-bold text-slate-300">Chưa có kịch bản nào được tạo</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {currentModule === "appliances"
                          ? "Cấu hình sản phẩm gia dụng ở cột bên trái và bấm 'Tạo Kịch Bản Gia Dụng & Prompt AI' để sinh kịch bản và prompt AI cầm trên tay tối ưu."
                          : "Cấu hình các thông số mong muốn ở cột bên trái và bấm nút 'Tạo Kịch Bản & Prompt AI' để bắt đầu chế tác kịch bản thời trang đỉnh cao của bạn."}
                      </p>
                    </div>
                  </div>
                )}

                {!loading && result && (
                  <div id="outputRealContent">
                    {activeTab === "script" ? (
                      <TimelineView
                        timeline={result.timeline}
                        selectedToneLabel={activeToneLabel}
                        totalDuration={duration}
                        onPlayTTS={handlePlayTTS}
                        onTimelineItemChange={handleTimelineItemChange}
                      />
                    ) : activeTab === "prompts" ? (
                      <PromptsView 
                        prompts={result.prompts} 
                        hooks={result.hooks}
                        customApiKey={customApiKey}
                        onOpenKeyManager={() => {
                          setTempApiKey(customApiKey);
                          setShowApiKey(false);
                          setIsKeyManagerOpen(true);
                        }}
                        onPromptChange={handlePromptTextChange} 
                      />
                    ) : (
                      <HooksView hooks={result.hooks} />
                    )}
                  </div>
                )}
              </div>

              {/* SAVED HISTORIES CARDS LIST */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
                <div className="flex items-center space-x-2">
                  <History className="w-4 h-4 text-slate-400" />
                  <span>Phiên tạo gần đây:</span>
                  <span id="historyCount" className="font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                    {history.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 justify-end" id="historyChips">
                  {history.length === 0 ? (
                    <span className="text-slate-600 italic">Chưa có kịch bản lưu trong lịch sử</span>
                  ) : (
                    history.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => handleApplyHistory(h)}
                        className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-750 border border-slate-700/60 hover:border-slate-600 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer flex items-center space-x-1"
                      >
                        <span>{h.module === "appliances" ? "🍳" : "👗"}</span>
                        <span>{h.snippet} ({h.duration}s - {h.tone})</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

            </div>
          </section>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600">
        <p>© 2026 NAM AI STUDIO. Nền tảng chuyên biệt cho Nhà sáng tạo Nội dung Thời trang &amp; Hàng Gia Dụng.</p>
      </footer>

      {/* KEY MANAGER DIALOG MODAL */}
      {isKeyManagerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-4 animate-in fade-in-50 zoom-in-95 duration-200">
            <button 
              type="button"
              onClick={() => setIsKeyManagerOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Key className="w-5 h-5 text-luxury-400" />
              <h3 className="text-base font-bold text-white">Cấu hình Gemini API KEY</h3>
            </div>

            <div className="space-y-3.5">
              <p className="text-xs text-slate-400 leading-relaxed">
                Hệ thống yêu cầu API KEY để kích hoạt các tác vụ AI (tạo kịch bản, prompt AI Video, TTS giọng đọc). Khi không có API Key, các tác vụ AI sẽ không thể hoạt động.
              </p>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    Khóa Gemini API Key
                  </label>
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[10px] text-luxury-400 hover:underline flex items-center"
                  >
                    Lấy khóa miễn phí Google AI Studio &rarr;
                  </a>
                </div>

                <div className="relative flex items-center">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="Dán Gemini API Key (AI Studio) vào đây..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-luxury-500 focus:ring-1 focus:ring-luxury-500 rounded-xl py-2.5 pl-3.5 pr-20 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 transition-all font-mono"
                  />
                  
                  {/* Action icons inside input */}
                  <div className="absolute right-2 flex items-center space-x-1">
                    {tempApiKey && (
                      <button
                        type="button"
                        title="Xóa ô nhập"
                        onClick={() => setTempApiKey("")}
                        className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer rounded-lg hover:bg-slate-800"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      title={showApiKey ? "Ẩn API Key" : "Bấm để xem API Key"}
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-slate-800 flex items-center justify-center"
                    >
                      {showApiKey ? (
                        <EyeOff className="w-4 h-4 text-luxury-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-400 hover:text-luxury-300" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-luxury-300 hover:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 border border-luxury-800/40 hover:border-luxury-600/60 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                  >
                    <Clipboard className="w-3.5 h-3.5 text-luxury-400" />
                    <span>Dán từ bộ nhớ tạm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="py-1.5 px-3 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 border border-slate-800 transition-all cursor-pointer"
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5 text-luxury-400" /> : <Eye className="w-3.5 h-3.5 text-luxury-400" />}
                    <span>{showApiKey ? "Ẩn mã Key" : "Xem mã Key"}</span>
                  </button>
                </div>
              </div>

              {customApiKey ? (
                <div className="bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-xl flex items-start space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-300">Đã cài đặt API KEY cá nhân</p>
                    <p className="text-[11px] text-emerald-400/80 leading-normal mt-0.5">
                      Hệ thống đang sử dụng API Key này để vận hành các tác vụ AI.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-950/30 border border-rose-800/40 p-3 rounded-xl flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-rose-300">Chưa nhập API KEY</p>
                    <p className="text-[11px] text-rose-300/80 leading-normal mt-0.5">
                      Khi chưa nhập API Key, tác vụ AI sẽ không hoạt động. Vui lòng dán Key và nhấn "Lưu cấu hình".
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsKeyManagerOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  const cleaned = tempApiKey.trim();
                  setCustomApiKey(cleaned);
                  localStorage.setItem("fc_customApiKey", cleaned);
                  setIsKeyManagerOpen(false);
                  if (cleaned) {
                    showToast("Đã lưu API KEY thành công! Các tác vụ AI đã sẵn sàng hoạt động.", "success");
                  } else {
                    showToast("Đã xóa API KEY. Các tác vụ AI sẽ tạm dừng.", "error");
                  }
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-luxury-600 via-rose-600 to-indigo-600 hover:from-luxury-500 hover:to-indigo-500 text-white text-xs font-bold cursor-pointer transition-all shadow-md active:scale-95"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM ACTION LOADING DOCK (WITH PAUSE & CANCEL) */}
      {loading && (
        <div 
          id="action-loading-dock" 
          className="fixed bottom-6 right-6 z-[120] max-w-md w-[calc(100vw-3rem)] sm:w-96 bg-slate-900/95 border border-luxury-500/60 rounded-2xl p-4 shadow-2xl backdrop-blur-xl transition-all animate-in slide-in-from-bottom-5 duration-300 ring-1 ring-luxury-400/30"
        >
          {/* Header with Title & Status */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-2.5">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-luxury-600 to-indigo-600 shadow-md">
                {isPaused ? (
                  <Pause className="w-4 h-4 text-amber-300 animate-pulse" />
                ) : (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                )}
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPaused ? 'bg-amber-400' : 'bg-luxury-400'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPaused ? 'bg-amber-500' : 'bg-luxury-400'}`}></span>
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span>{isPaused ? "ĐANG TẠM DỪNG TIẾN TRÌNH" : "ĐANG TẠO KỊCH BẢN & PROMPT"}</span>
                </h4>
                <p className="text-[11px] text-luxury-300 font-medium truncate max-w-[190px] sm:max-w-[220px]">
                  {isPaused ? "Nhấn 'Tiếp tục' để khôi phục tiến độ" : loadingStep}
                </p>
              </div>
            </div>

            {/* Timer badge */}
            <div className="bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800 text-[11px] font-mono font-bold text-slate-300">
              {Math.floor(loadingElapsed / 60).toString().padStart(2, '0')}:{(loadingElapsed % 60).toString().padStart(2, '0')}s
            </div>
          </div>

          {/* Animated progress bar */}
          <div className="w-full bg-slate-950 rounded-full h-1.5 mb-3 overflow-hidden border border-slate-800">
            <div 
              className={`h-full transition-all duration-300 ${
                isPaused 
                  ? "bg-amber-500 w-full" 
                  : "bg-gradient-to-r from-luxury-500 via-rose-500 to-indigo-500 animate-pulse w-full"
              }`}
            ></div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-800/80">
            <button
              type="button"
              id="btn-pause-resume"
              onClick={handleTogglePause}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-all border ${
                isPaused
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/40 shadow-md"
                  : "bg-slate-800 hover:bg-slate-750 text-amber-300 border-amber-500/30 hover:text-amber-200"
              }`}
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Tiếp tục</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Tạm dừng</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-cancel-generation"
              onClick={handleCancelGeneration}
              className="px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-all border border-rose-800/40 shadow-md active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              <span>Hủy bỏ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
