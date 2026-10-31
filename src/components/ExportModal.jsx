import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Download, 
  FileText, 
  Calendar, 
  Code, 
  Copy, 
  Check, 
  Share2,
  Sparkles
} from 'lucide-react';
import { 
  exportToMarkdown, 
  exportToPlainText, 
  exportToICS, 
  downloadFile 
} from '../services/exportService';

export default function ExportModal({ isOpen, onClose }) {
  const { currentSession } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const mdContent = exportToMarkdown(currentSession || {});
  const txtContent = exportToPlainText(currentSession || {});
  const jsonContent = JSON.stringify(currentSession || {}, null, 2);

  const handleDownloadMD = () => {
    downloadFile(mdContent, `UNMESS_Plan_${new Date().toISOString().slice(0, 10)}.md`, 'text/markdown');
  };

  const handleDownloadTXT = () => {
    downloadFile(txtContent, `UNMESS_Plan_${new Date().toISOString().slice(0, 10)}.txt`, 'text/plain');
  };

  const handleDownloadICS = () => {
    const ics = exportToICS(currentSession?.tasks || [], currentSession?.deadlines || []);
    downloadFile(ics, `UNMESS_Deadlines_${new Date().toISOString().slice(0, 10)}.ics`, 'text/calendar');
  };

  const handleDownloadJSON = () => {
    downloadFile(jsonContent, `UNMESS_Export_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(mdContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface-container rounded-2xl border border-outline-variant/40 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-tertiary/20 text-tertiary flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm font-headline font-bold text-on-surface uppercase tracking-wider">
                Export Clarity Plan
              </h2>
              <span className="text-[11px] text-on-surface-variant font-mono">
                Download structured output to your favorite productivity tools
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container-high transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Export Options Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={handleDownloadMD}
              className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 flex flex-col items-center gap-2 text-center transition-all group"
            >
              <FileText className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-on-surface">Markdown</span>
              <span className="text-[10px] text-on-surface-variant font-mono">Notion / Obsidian</span>
            </button>

            <button
              onClick={handleDownloadICS}
              className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 flex flex-col items-center gap-2 text-center transition-all group"
            >
              <Calendar className="w-5 h-5 text-tertiary group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-on-surface">iCalendar</span>
              <span className="text-[10px] text-on-surface-variant font-mono">Google / Apple Cal</span>
            </button>

            <button
              onClick={handleDownloadTXT}
              className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 flex flex-col items-center gap-2 text-center transition-all group"
            >
              <FileText className="w-5 h-5 text-secondary-fixed group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-on-surface">Plain Text</span>
              <span className="text-[10px] text-on-surface-variant font-mono">Notes / Clipboard</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 flex flex-col items-center gap-2 text-center transition-all group"
            >
              <Code className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-on-surface">JSON Format</span>
              <span className="text-[10px] text-on-surface-variant font-mono">Developers / API</span>
            </button>
          </div>

          {/* Quick Copy Button */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-on-surface">One-Click Markdown Copy</span>
            </div>
            <button
              onClick={handleCopyClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-glow hover:bg-primary-container transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy All'}</span>
            </button>
          </div>

          {/* Live Preview */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">
              Preview (Markdown Output)
            </span>
            <pre className="bg-surface-container-lowest text-xs text-on-surface-variant font-mono p-4 rounded-xl border border-outline-variant/30 max-h-48 overflow-y-auto whitespace-pre-wrap select-all">
              {mdContent}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

