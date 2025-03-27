import { Highlight } from '../types';
import { useState, useEffect } from 'react';

interface HighlightCardProps {
  highlight: Highlight;
  onDelete: (id: string) => void;
}

interface DictionaryResponse {
  word: string;
  phonetic?: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
    }[];
  }[];
}

export default function HighlightCard({ highlight, onDelete }: HighlightCardProps) {
  const [dictionaryData, setDictionaryData] = useState<DictionaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchDictionaryData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${highlight.highlightedText}`);
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const firstEntry = data[0];
        setDictionaryData({
          word: firstEntry.word,
          phonetic: firstEntry.phonetic,
          meanings: firstEntry.meanings.map((m: any) => ({
            partOfSpeech: m.partOfSpeech,
            definitions: m.definitions.map((d: any) => ({
              definition: d.definition,
              example: d.example
            }))
          }))
        });
      }
    } catch (err) {
      setError('Failed to fetch dictionary data');
      console.error('Failed to fetch dictionary data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDictionaryClick = () => {
    if (!dictionaryData) {
      fetchDictionaryData();
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="p-3 border-b border-gray-100 bg-blue-50 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-xs text-gray-500">
            {new Date(highlight.timestamp).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          {highlight.isLearned && (
            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
              Learned
            </span>
          )}
          {highlight.isFavorite && (
            <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
              Favorite
            </span>
          )}
        </div>
        <button
          onClick={() => onDelete(highlight.id)}
          className="text-gray-400 hover:text-red-500 transition-colors duration-200"
          aria-label="Delete highlight"
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
        
        {/* 词典按钮 */}
        <button
          onClick={handleDictionaryClick}
          className="mt-3 flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 mr-1 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-sm font-medium">Dictionary</span>
        </button>
        
        {/* 词典释义部分 */}
        {isExpanded && (
          <>
            {isLoading && (
              <div className="mt-4 flex items-center text-gray-500">
                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading dictionary data...
              </div>
            )}
            
            {error && (
              <div className="mt-4 text-red-500 text-sm">
                {error}
              </div>
            )}
            
            {dictionaryData && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                {dictionaryData.phonetic && (
                  <div className="text-gray-500 text-sm mb-2">
                    {dictionaryData.phonetic}
                  </div>
                )}
                {dictionaryData.meanings.map((meaning, index) => (
                  <div key={index} className="mb-3">
                    <div className="text-sm font-medium text-gray-700 italic mb-1">
                      {meaning.partOfSpeech}
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      {meaning.definitions.map((def, defIndex) => (
                        <li key={defIndex} className="text-sm text-gray-600">
                          {def.definition}
                          {def.example && (
                            <div className="text-gray-500 text-xs mt-1 ml-2">
                              Example: {def.example}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 