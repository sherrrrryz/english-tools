import { useState, useEffect } from 'react';
import { TextDocument, Highlight } from '../types';

interface TextReaderProps {
  document: TextDocument;
  onHighlight: (highlight: Highlight) => void;
  onDelete: (id: string) => void;
  highlights: Highlight[]; // 添加highlights属性以获取当前文档的所有高亮
}

export default function TextReader({ document, onHighlight, onDelete, highlights }: TextReaderProps) {
  // 过滤出属于当前文档的高亮
  const documentHighlights = highlights.filter(h => h.textId === document.id);
  
  // 渲染带高亮的文本内容
  const renderHighlightedContent = () => {
    let content = document.content;
    let segments = [];
    let lastIndex = 0;
    
    // 按高亮出现位置排序
    const sortedHighlights = [...documentHighlights].sort((a, b) => {
      const indexA = content.indexOf(a.highlightedText);
      const indexB = content.indexOf(b.highlightedText);
      return indexA - indexB;
    });
    
    // 分段渲染文本，高亮部分使用特殊样式
    for (const highlight of sortedHighlights) {
      const highlightText = highlight.highlightedText;
      const index = content.indexOf(highlightText, lastIndex);
      
      // 如果找不到高亮文本，跳过
      if (index === -1) continue;
      
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
          {highlightText}
        </span>
      );
      
      lastIndex = index + highlightText.length;
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

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === '') return;

    const selectedStr = selection.toString().trim();

    // 获取包含所选文本的句子
    const range = selection.getRangeAt(0);
    const startNode = range.startContainer;
    const text = startNode.textContent || '';
    
    // 简单分句，按句号、问号、感叹号分割
    const sentences = text.split(/[.!?。！？]/);
    let sentenceWithHighlight = '';
    
    for (const sentence of sentences) {
      if (sentence.includes(selectedStr)) {
        sentenceWithHighlight = sentence.trim();
        break;
      }
    }
    
    // 如果无法找到包含高亮文本的句子，就使用前后50个字符
    if (!sentenceWithHighlight) {
      const nodeText = text;
      const selectionIndex = nodeText.indexOf(selectedStr);
      if (selectionIndex >= 0) {
        const start = Math.max(0, selectionIndex - 50);
        const end = Math.min(nodeText.length, selectionIndex + selectedStr.length + 50);
        sentenceWithHighlight = nodeText.substring(start, end).trim();
      } else {
        sentenceWithHighlight = selectedStr;
      }
    }

    const newHighlight: Highlight = {
      id: Date.now().toString(),
      textId: document.id,
      highlightedText: selectedStr,
      sentence: sentenceWithHighlight,
      timestamp: Date.now(),
    };

    onHighlight(newHighlight);
    selection.removeAllRanges(); // 清除选择，避免重复高亮
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
        className="prose max-w-none"
        onMouseUp={handleTextSelection}
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {renderHighlightedContent()}
      </div>
    </div>
  );
} 