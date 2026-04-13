import { X, Moon, Sun, Phone, Video } from "lucide-react";

interface ChatHeaderProps {
  onClose: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

const ChatHeader = ({ onClose, darkMode, onToggleDark }: ChatHeaderProps) => (
  <div className="bg-[#0084ff] text-white px-4 py-3 flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm shrink-0">
      EC
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm leading-tight">Emery Collection</p>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
        <span className="text-[11px] text-white/70">
          Active now
        </span>
      </div>
    </div>
    <button
      onClick={onToggleDark}
      className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
      aria-label="Toggle dark mode"
    >
      {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
    <button
      onClick={onClose}
      className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
      aria-label="Close chat"
    >
      <X className="h-5 w-5" />
    </button>
  </div>
);

export default ChatHeader;
