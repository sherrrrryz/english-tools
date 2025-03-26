import { Highlight } from '../types';

interface HighlightCardProps {
  highlight: Highlight;
  onDelete: (id: string) => void;
}

export default function HighlightCard({ highlight, onDelete }: HighlightCardProps) {
  return (
    <div className="bg-white shadow rounded p-4 mb-4">
      <div className="flex justify-between">
        <span className="text-xs text-gray-500">
          {new Date(highlight.timestamp).toLocaleString()}
        </span>
        <button
          onClick={() => onDelete(highlight.id)}
          className="text-red-500 hover:text-red-700 text-xs"
          aria-label="删除高亮"
        >
          删除
        </button>
      </div>
      <div className="mt-2">
        <div className="font-bold text-lg mb-2 text-blue-600">
          {highlight.highlightedText}
        </div>
        <div className="text-gray-700 italic">
          {highlight.sentence}
        </div>
      </div>
    </div>
  );
} 