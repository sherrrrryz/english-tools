import { useState, useEffect, useRef } from 'react';
import { TextDocument, Highlight } from '../types';

interface TextReaderProps {
  document: TextDocument;
  onHighlight: (highlight: Highlight) => void;
  onDelete: (id: string) => void;
  highlights: Highlight[]; // 添加highlights属性以获取当前文档的所有高亮
}

export default function TextReader({ document, onHighlight, onDelete, highlights }: TextReaderProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // 过滤出属于当前文档的高亮
  const documentHighlights = highlights.filter(h => h.textId === document.id);
  
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
      
      // 添加高亮文本
      segments.push(
        <span 
          key={`highlight-${index}`} 
          className="bg-yellow-200 px-1 rounded"
          title={`创建于: ${new Date(highlight.timestamp).toLocaleString()}`}
        >
          {highlight.highlightedText}
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

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === '') return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    // 获取选中文本在文档中的精确位置
    const position = getSelectionPosition(selection);
    if (position === null) return;

    // 验证选中的文本
    if (document.content.substring(position, position + selectedText.length) !== selectedText) {
      console.error('选中文本位置验证失败');
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
    <div className="mb-6 p-4 bg-gray-50 rounded shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">
          {new Date(document.timestamp).toLocaleString()}
        </h3>
        <button
          onClick={() => onDelete(document.id)}
          className="text-red-500 hover:text-red-700"
          aria-label="删除"
        >
          删除
        </button>
      </div>
      <div
        ref={contentRef}
        className="prose max-w-none"
        onMouseUp={handleTextSelection}
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {renderHighlightedContent()}
      </div>
    </div>
  );
} 