"use client";

import { useState, useEffect, useRef } from 'react';
import TextUploader from './components/TextUploader';
import TextReader from './components/TextReader';
import HighlightCard from './components/HighlightCard';
import { TextDocument, Highlight } from './types';

export default function Home() {
  const [documents, setDocuments] = useState<TextDocument[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 从本地存储加载数据
  useEffect(() => {
    // 确保代码运行在浏览器环境中
    if (typeof window !== 'undefined') {
      setIsLoading(true);
      try {
        const savedDocuments = localStorage.getItem('text-reader-documents');
        const savedHighlights = localStorage.getItem('text-reader-highlights');
        
        if (savedDocuments) {
          setDocuments(JSON.parse(savedDocuments));
        }
        
        if (savedHighlights) {
          setHighlights(JSON.parse(savedHighlights));
        }

        // 恢复滚动位置
        const savedScrollPosition = localStorage.getItem('text-reader-scroll');
        if (savedScrollPosition) {
          setTimeout(() => {
            window.scrollTo(0, parseInt(savedScrollPosition));
          }, 100);
        }
      } catch (error) {
        console.error('读取本地存储时出错:', error);
      } finally {
        setIsLoaded(true);
        setIsLoading(false);
      }
    }
  }, []);

  // 保存数据到本地存储
  useEffect(() => {
    // 确保数据已从本地存储加载完毕，并且代码运行在浏览器环境中
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem('text-reader-documents', JSON.stringify(documents));
        localStorage.setItem('text-reader-highlights', JSON.stringify(highlights));
      } catch (error) {
        console.error('保存到本地存储时出错:', error);
      }
    }
  }, [documents, highlights, isLoaded]);

  // 保存滚动位置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => {
        try {
          localStorage.setItem('text-reader-scroll', window.scrollY.toString());
        } catch (error) {
          console.error('保存滚动位置时出错:', error);
        }
      };

      // 使用防抖函数减少保存次数
      let timeout: NodeJS.Timeout;
      const debouncedHandleScroll = () => {
        clearTimeout(timeout);
        timeout = setTimeout(handleScroll, 100);
      };

      window.addEventListener('scroll', debouncedHandleScroll);
      return () => {
        window.removeEventListener('scroll', debouncedHandleScroll);
        clearTimeout(timeout);
      };
    }
  }, []);

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

  // 导出数据为JSON文件
  const handleExportData = () => {
    if (typeof window !== 'undefined') {
      try {
        const exportData = {
          documents,
          highlights,
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
        
        const exportFileName = `text-reader-backup-${new Date().toISOString().slice(0, 10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
      } catch (error) {
        console.error('导出数据时出错:', error);
        alert('导出数据失败，请稍后再试');
      }
    }
  };

  // 导入数据
  const handleImportData = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 处理文件上传
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        if (importedData.documents && Array.isArray(importedData.documents)) {
          setDocuments(importedData.documents);
        }
        
        if (importedData.highlights && Array.isArray(importedData.highlights)) {
          setHighlights(importedData.highlights);
        }
        
        alert('数据导入成功');
      } catch (error) {
        console.error('导入数据时出错:', error);
        alert('导入数据失败，请确保文件格式正确');
      }
    };
    
    reader.readAsText(file);
    
    // 重置文件输入以允许上传相同的文件
    if (event.target) {
      event.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg">正在加载数据...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-3">
          <TextUploader onTextUpload={handleTextUpload} />
        </div>
        
        <div className="md:col-span-3">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">我的文本</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleExportData}
                  className="btn-success text-sm"
                >
                  导出数据
                </button>
                <button
                  onClick={handleImportData}
                  className="btn-primary text-sm"
                >
                  导入数据
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".json"
                />
              </div>
            </div>
            
            {documents.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">暂无内容，请上传文本</p>
              </div>
            ) : (
              documents.map(doc => (
                <div key={doc.id} className="mb-8">
                  <TextReader
                    document={doc}
                    onHighlight={handleHighlight}
                    onDelete={handleTextDelete}
                    highlights={highlights}
                    onHighlightDelete={handleHighlightDelete}
                  />
                  
                  {/* 显示当前文档相关的高亮卡片 */}
                  <div className="mt-4 ml-0">
                    {highlights.filter(h => h.textId === doc.id).length > 0 ? (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center text-blue-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          单词本
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                          {highlights
                            .filter(h => h.textId === doc.id)
                            .map(highlight => (
                              <HighlightCard
                                key={highlight.id}
                                highlight={highlight}
                                onDelete={handleHighlightDelete}
                              />
                            ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 