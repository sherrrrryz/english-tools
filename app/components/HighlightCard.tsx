import { Highlight } from '../types';

interface HighlightCardProps {
  highlight: Highlight;
  onDelete: (id: string) => void;
}

export default function HighlightCard({ highlight, onDelete }: HighlightCardProps) {
  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="p-3 border-b border-gray-100 bg-blue-50 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-xs text-gray-500">
            {new Date(highlight.timestamp).toLocaleString('zh-CN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          {highlight.isLearned && (
            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
              已学习
            </span>
          )}
          {highlight.isFavorite && (
            <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
              已收藏
            </span>
          )}
        </div>
        <button
          onClick={() => onDelete(highlight.id)}
          className="text-gray-400 hover:text-red-500 transition-colors duration-200"
          aria-label="删除高亮"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-4">
        <div className="font-bold text-lg mb-2 text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">
          {highlight.highlightedText}
        </div>
        <div className="text-gray-600 text-sm mt-2 border-l-2 border-gray-200 pl-3 italic">
          {highlight.sentence}
        </div>
      </div>
    </div>
  );
} 