"use client";

import { useState, useEffect } from 'react';
import TextUploader from './components/TextUploader';
import TextReader from './components/TextReader';
import HighlightCard from './components/HighlightCard';
import { TextDocument, Highlight } from './types';

export default function Home() {
  const [documents, setDocuments] = useState<TextDocument[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  // 从本地存储加载数据
  useEffect(() => {
    const savedDocuments = localStorage.getItem('text-reader-documents');
    const savedHighlights = localStorage.getItem('text-reader-highlights');
    
    if (savedDocuments) {
      setDocuments(JSON.parse(savedDocuments));
    }
    
    if (savedHighlights) {
      setHighlights(JSON.parse(savedHighlights));
    }
  }, []);

  // 保存数据到本地存储
  useEffect(() => {
    localStorage.setItem('text-reader-documents', JSON.stringify(documents));
    localStorage.setItem('text-reader-highlights', JSON.stringify(highlights));
  }, [documents, highlights]);

  // 处理文本上传
  const handleTextUpload = (newDocument: TextDocument) => {
    setDocuments(prev => [newDocument, ...prev]);
  };

  // 处理文本删除
  const handleTextDelete = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    // 同时删除相关的高亮
    setHighlights(prev => prev.filter(highlight => highlight.textId !== id));
  };

  // 处理高亮添加
  const handleHighlight = (newHighlight: Highlight) => {
    setHighlights(prev => [newHighlight, ...prev]);
  };

  // 处理高亮删除
  const handleHighlightDelete = (id: string) => {
    setHighlights(prev => prev.filter(highlight => highlight.id !== id));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">文本阅读器</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <TextUploader onTextUpload={handleTextUpload} />
          
          <div>
            <h2 className="text-xl font-bold mb-4">我的文本</h2>
            {documents.length === 0 ? (
              <p className="text-gray-500">暂无内容，请上传文本。</p>
            ) : (
              documents.map(doc => (
                <TextReader
                  key={doc.id}
                  document={doc}
                  onHighlight={handleHighlight}
                  onDelete={handleTextDelete}
                  highlights={highlights}
                />
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">我的高亮卡片</h2>
          {highlights.length === 0 ? (
            <p className="text-gray-500">
              暂无高亮内容。请在左侧选择文本来创建高亮。
            </p>
          ) : (
            <div className="space-y-4">
              {highlights.map(highlight => (
                <HighlightCard
                  key={highlight.id}
                  highlight={highlight}
                  onDelete={handleHighlightDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 