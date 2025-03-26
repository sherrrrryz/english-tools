import { useState, useRef, ChangeEvent } from 'react';
import { TextDocument } from '../types';

interface TextUploaderProps {
  onTextUpload: (text: TextDocument) => void;
}

export default function TextUploader({ onTextUpload }: TextUploaderProps) {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newDocument: TextDocument = {
      id: Date.now().toString(),
      content: text,
      timestamp: Date.now(),
    };

    onTextUpload(newDocument);
    setText('');
    setFileName('');
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
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
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-2">上传文本</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={triggerFileInput}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
            >
              选择文件
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.text,.md"
              className="hidden"
            />
            {fileName && <span className="text-sm text-gray-600">{fileName}</span>}
          </div>
          <p className="text-sm text-gray-500 mb-2">或者直接输入文本</p>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={5}
          placeholder="在此输入文本或上传文本文件..."
          required
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded self-start"
        >
          上传
        </button>
      </form>
    </div>
  );
} 