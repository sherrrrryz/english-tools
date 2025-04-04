import { useState, useRef, ChangeEvent } from 'react';
import { TextDocument } from '../types';

interface TextUploaderProps {
  onTextUpload: (text: TextDocument) => void;
}

export default function TextUploader({ onTextUpload }: TextUploaderProps) {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newDocument: TextDocument = {
      id: Date.now().toString(),
      content: text,
      timestamp: Date.now(),
      title: title.trim() || 'Untitled'
    };

    onTextUpload(newDocument);
    setText('');
    setTitle('');
    setFileName('');
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setTitle(file.name.replace(/\.[^/.]+$/, '')); // 使用文件名作为默认标题
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="card mb-8">
      <div className="card-header">
        <h2 className="text-xl font-bold">Upload New Text</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <button
                type="button"
                onClick={triggerFileInput}
                className="btn-secondary flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Choose File
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.text,.md"
                className="hidden"
              />
              {fileName && (
                <span className="text-sm text-gray-600 bg-gray-100 py-1 px-3 rounded-full flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {fileName}
                </span>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title (optional)"
                className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter or paste your text here..."
              className="w-full h-32 p-4 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!text.trim()}
              className={`btn-primary ${!text.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 