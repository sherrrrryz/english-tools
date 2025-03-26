"use client";

import { useState, useEffect } from 'react';
import { Highlight, WordFilterType } from '../types';
import HighlightCard from '../components/HighlightCard';
import Navbar from '../components/Navbar';

export default function WordsPage() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<WordFilterType>('all');

  // 从本地存储加载数据
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoading(true);
      try {
        const savedHighlights = localStorage.getItem('text-reader-highlights');
        
        if (savedHighlights) {
          setHighlights(JSON.parse(savedHighlights));
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
        localStorage.setItem('text-reader-highlights', JSON.stringify(highlights));
      } catch (error) {
        console.error('保存到本地存储时出错:', error);
      }
    }
  }, [highlights, isLoaded]);

  // 处理高亮删除
  const handleHighlightDelete = (id: string) => {
    setHighlights(prev => prev.filter(highlight => highlight.id !== id));
  };

  // 处理标记为已学习
  const handleToggleLearned = (id: string) => {
    setHighlights(prev => 
      prev.map(highlight => 
        highlight.id === id 
          ? { ...highlight, isLearned: !highlight.isLearned } 
          : highlight
      )
    );
  };

  // 处理收藏
  const handleToggleFavorite = (id: string) => {
    setHighlights(prev => 
      prev.map(highlight => 
        highlight.id === id 
          ? { ...highlight, isFavorite: !highlight.isFavorite } 
          : highlight
      )
    );
  };

  // 根据筛选条件过滤高亮
  const filteredHighlights = highlights.filter(highlight => {
    // 首先应用搜索条件
    const matchesSearch = searchQuery === '' || 
      highlight.highlightedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      highlight.sentence.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // 然后应用筛选类型
    switch (filter) {
      case 'learned':
        return highlight.isLearned === true;
      case 'favorite':
        return highlight.isFavorite === true;
      case 'unlearned':
        return highlight.isLearned !== true;
      case 'all':
      default:
        return true;
    }
  });

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
      <Navbar />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">我的单词本</h1>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-1/2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="搜索单词或句子..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2 w-full md:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('learned')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                filter === 'learned' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              已学习
            </button>
            <button
              onClick={() => setFilter('favorite')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                filter === 'favorite' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              收藏
            </button>
            <button
              onClick={() => setFilter('unlearned')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                filter === 'unlearned' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              未学习
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHighlights.length > 0 ? (
            filteredHighlights.map(highlight => (
              <div key={highlight.id} className="relative group">
                <HighlightCard
                  highlight={highlight}
                  onDelete={handleHighlightDelete}
                />
                <div className="absolute top-0 right-0 p-2 flex space-x-1">
                  <button
                    onClick={() => handleToggleLearned(highlight.id)}
                    className={`p-1 rounded-full ${
                      highlight.isLearned ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title={highlight.isLearned ? "已学习" : "标记为已学习"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleToggleFavorite(highlight.id)}
                    className={`p-1 rounded-full ${
                      highlight.isFavorite ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title={highlight.isFavorite ? "已收藏" : "收藏"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full card p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">
                {searchQuery ? '没有找到匹配的单词' : '暂无单词，请在阅读页面添加高亮'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 