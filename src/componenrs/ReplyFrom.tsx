'use client';

import { useState } from 'react';
import * as apiClient from '@/lib/apiClient';
import { Reply } from '@/types';

// 親コンポーネントから受け取る情報と関数の型定義
interface ReplyFormProps {
  postId: number;
  onReplyCreated: (newReply: Reply) => void;
}

export default function ReplyForm({ postId, onReplyCreated }: ReplyFormProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const characterLimit = 140;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!content.trim() || content.length > characterLimit) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('返信するにはログインが必要です。');
      return;
    }

    setIsLoading(true);
    try {
      // apiClientを使って返信を作成
      const newReply = await apiClient.createReply(postId, content, token);
      setContent(''); // フォームをクリア
      onReplyCreated(newReply); // 親コンポーネントに新しい返信を通知
    } catch (err) {
      setError('返信に失敗しました。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        rows={2}
        placeholder="返信する..."
        maxLength={characterLimit}
      />
      <div className="flex justify-end items-center mt-2">
        <p className={`text-xs mr-4 ${content.length > characterLimit ? 'text-red-500' : 'text-gray-500'}`}>
          {content.length} / {characterLimit}
        </p>
        <button
          type="submit"
          disabled={isLoading || !content.trim() || content.length > characterLimit}
          className="bg-sky-500 text-white font-bold py-1 px-4 rounded-full text-sm hover:bg-sky-600 disabled:bg-gray-300 transition"
        >
          {isLoading ? '送信中...' : '返信する'}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </form>
  );
}