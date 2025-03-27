import { useState, useEffect, useRef } from 'react';
import { TextDocument, Highlight } from '../types';

interface TextReaderProps {
  document: TextDocument;
  onHighlight: (highlight: Highlight) => void;
  onDelete: (id: string) => void;
  highlights: Highlight[]; // 添加highlights属性以获取当前文档的所有高亮
  onHighlightDelete?: (id: string) => void; // 添加删除高亮的回调
}

export default function TextReader({ document, onHighlight, onDelete, highlights, onHighlightDelete }: TextReaderProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // 过滤出属于当前文档的高亮
  const documentHighlights = highlights.filter(h => h.textId === document.id);
  
  // 添加复制功能
  const handleCopy = () => {
    if (contentRef.current) {
      const text = contentRef.current.innerText;
      navigator.clipboard.writeText(text).then(() => {
        // 可以添加一个提示，但这里我们暂时不添加
      }).catch(err => {
        console.error('复制失败:', err);
      });
    }
  };
  
  // 处理高亮删除
  const handleHighlightDelete = (id: string) => {
    if (onHighlightDelete) {
      onHighlightDelete(id);
    }
  };

  // 渲染带高亮的文本内容
  const renderHighlightedContent = () => {
    let content = document.content;
    let segments = [];
    let lastIndex = 0;
    
    // 按高亮出现位置排序
    const sortedHighlights = [...documentHighlights]
      .sort((a, b) => {
        // 使用保存的位置信息
        if (a.position !== undefined && b.position !== undefined) {
          return a.position - b.position;
        }
        return 0;
      });
    
    // 分段渲染文本，高亮部分使用特殊样式
    for (const highlight of sortedHighlights) {
      // 使用保存的位置信息
      const index = highlight.position ?? -1;
      if (index === -1) continue;
      
      // 验证位置的文本是否匹配
      if (content.substring(index, index + highlight.highlightedText.length) !== highlight.highlightedText) {
        continue;
      }
      
      // 添加高亮前的普通文本
      if (index > lastIndex) {
        segments.push(
          <span key={`text-${lastIndex}-${index}`}>
            {content.substring(lastIndex, index)}
          </span>
        );
      }
      
      // 添加高亮文本，包含悬停时显示的删除按钮
      segments.push(
        <span 
          key={`highlight-${index}`} 
          className="relative group bg-yellow-200 px-1 rounded shadow-sm text-blue-900 font-medium hover:bg-yellow-300 transition-colors duration-200"
          title={`Created: ${new Date(highlight.timestamp).toLocaleString()}`}
        >
          {highlight.highlightedText}
          <button
            className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white text-red-500 border border-red-200 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              handleHighlightDelete(highlight.id);
            }}
            aria-label="Remove highlight"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      );
      
      lastIndex = index + highlight.highlightedText.length;
    }
    
    // 添加最后一段普通文本
    if (lastIndex < content.length) {
      segments.push(
        <span key={`text-${lastIndex}-end`}>
          {content.substring(lastIndex)}
        </span>
      );
    }
    
    return segments.length > 0 ? segments : content;
  };

  // 获取选中文本在文档中的精确位置
  const getSelectionPosition = (selection: Selection): number | null => {
    if (!contentRef.current) return null;
    
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(contentRef.current);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    return preCaretRange.toString().length;
  };

  // 获取包含指定位置的完整句子
  const getSentenceAtPosition = (text: string, position: number): string => {
    // 查找句子的开始位置（上一个句号之后）
    let startPos = 0;
    for (let i = position; i >= 0; i--) {
      if (/[.!?。！？]/.test(text[i])) {
        startPos = i + 1;
        break;
      }
    }
    
    // 查找句子的结束位置（下一个句号）
    let endPos = text.length;
    for (let i = position; i < text.length; i++) {
      if (/[.!?。！？]/.test(text[i])) {
        endPos = i + 1;
        break;
      }
    }
    
    return text.substring(startPos, endPos).trim();
  };

  const handleTextSelection = (e: React.MouseEvent) => {
    // 如果点击的是删除按钮或其子元素，不处理选择
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === '') return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    // 获取选中文本在文档中的精确位置
    const position = getSelectionPosition(selection);
    if (position === null) return;

    // 验证选中的文本
    if (document.content.substring(position, position + selectedText.length) !== selectedText) {
      console.error('Selected text position validation failed');
      return;
    }

    // 获取选中文本所在的完整句子
    const sentence = getSentenceAtPosition(document.content, position);

    const newHighlight: Highlight = {
      id: Date.now().toString(),
      textId: document.id,
      highlightedText: selectedText,
      sentence: sentence,
      timestamp: Date.now(),
      position: position
    };

    onHighlight(newHighlight);
    selection.removeAllRanges();
  };

  return (
    <div className="card mb-6 overflow-hidden">
      <div className="card-header">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <div>
            <span className="text-lg font-semibold">
              {new Date(document.timestamp).toLocaleDateString('en-US', { 
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <div className="text-xs text-gray-500">
              {new Date(document.timestamp).toLocaleTimeString('en-US', { 
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="text-gray-500 hover:text-blue-600 transition-colors duration-200 flex items-center"
            title="复制全文"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(document.id)}
            className="text-gray-500 hover:text-red-600 transition-colors duration-200 flex items-center"
            aria-label="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <div
        ref={contentRef}
        className="card-body prose max-w-none bg-white text-gray-800 text-base leading-relaxed"
        onMouseUp={handleTextSelection}
        style={{ whiteSpace: 'pre-wrap' }}
      >
        <div className="p-1">
          {renderHighlightedContent()}
        </div>
      </div>
      <div className="bg-gray-50 p-3 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Select text to add to vocabulary</span>
        </div>
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Highlights: {documentHighlights.length}</span>
        </div>
      </div>
    </div>
  );
} 