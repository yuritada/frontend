'use client';

import { useState } from 'react';
import * as apiClient from '@/lib/apiClient';
import { Post } from '@/types';

// 親コンポーネントに新しい投稿を通知するための型定義
interface PostFormProps {
  onPostCreated: (newPost: Post) => void;
}

export default function PostForm({ onPostCreated }: PostFormProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const characterLimit = 140;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // 文字数チェック
    if (content.length === 0 || content.length > characterLimit) {
      setError('投稿は1文字以上140文字以内で入力してください。');
      return;
    }

    // localStorageから認証トークンを取得
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('ログインが必要です。');
      return;
    }

    setIsLoading(true);
    try {
      // APIクライアントを使って投稿処理を実行
      const newPost = await apiClient.createPost(content, token);
      
      // フォームをクリア
      setContent('');
      
      // 親コンポーネントに新しい投稿が作成されたことを通知
      onPostCreated(newPost);

    } catch (err) {
      setError('投稿に失敗しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = isLoading || content.length === 0 || content.length > characterLimit;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-bold mb-4">投稿する</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          rows={3}
          placeholder="いまどうしてる？"
          maxLength={characterLimit}
        />
        <div className="flex justify-between items-center mt-2">
          <p className={`text-sm ${content.length > characterLimit ? 'text-red-500' : 'text-gray-500'}`}>
            {content.length} / {characterLimit}
          </p>
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-600 focus:outline-none focus:shadow-outline disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isLoading ? '投稿中...' : '投稿'}
          </button>
        </div>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </form>
    </div>
  );
}