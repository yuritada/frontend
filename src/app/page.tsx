'use client';

import { useEffect, useState, useCallback } from 'react';
import { Post } from '@/types';
import * as apiClient from '@/lib/apiClient';
import PostForm from '@/componenrs/PostForm';
import Link from 'next/link';
import { DIALECTS } from '@/constants/dialects';

// 翻訳されたテキストを管理するための型
type TranslatedTexts = Record<string, string>; // 例: { 'post-1': '変換後テキスト' }

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // --- 方言ガチャ関連のState ---
  const [currentDialect, setCurrentDialect] = useState('標準語');
  const [translatedTexts, setTranslatedTexts] = useState<TranslatedTexts>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // 初回データ取得
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) setIsLoggedIn(true);

    const fetchTimeline = async () => {
      try {
        const timelinePosts = await apiClient.getTimeline();
        setPosts(timelinePosts);
      } catch (err) {
        setError('タイムラインの読み込みに失敗しました。');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimeline();
  }, []);

  // 方言ガチャのメインロジック
  const handleGacha = useCallback(async () => {
    if (posts.length === 0) return;
    setIsTranslating(true);
    
    // 現在とは違う方言をランダムに選択
    const otherDialects = DIALECTS.filter(d => d !== currentDialect);
    const newDialect = otherDialects[Math.floor(Math.random() * otherDialects.length)];
    
    // APIに送るためのリクエストデータを作成
    const requestItems = posts.flatMap(post => [
      { type: 'post' as const, id: post.id, text: post.original_text },
      ...post.replies.map(reply => ({ type: 'reply' as const, id: reply.id, text: reply.original_text }))
    ]);

    try {
      const response = await apiClient.translateTexts({ dialect: newDialect, texts: requestItems });
      
      // レスポンスをUIで使いやすい形式に変換
      const newTranslations: TranslatedTexts = {};
      response.results.forEach(item => {
        const key = `${item.type}-${item.id}`;
        newTranslations[key] = item.translated_text;
      });

      setTranslatedTexts(newTranslations);
      setCurrentDialect(newDialect);

    } catch (err) {
      setError('方言への変換に失敗しました。');
    } finally {
      setIsTranslating(false);
    }
  }, [posts, currentDialect]);

  // 1分ごとの自動更新
  useEffect(() => {
    if(posts.length > 0){
      const intervalId = setInterval(handleGacha, 60000); // 60秒 = 1分
      return () => clearInterval(intervalId); // コンポーネントが消える時にタイマーを解除
    }
  }, [posts.length, handleGacha]);


  const handlePostCreated = (newPost: Post) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  return (
    <main className="bg-gray-100 min-h-screen">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">方言ガチャSNS</h1>
          <p className="text-gray-500">投稿がいろんな方言に変わるSNS</p>
        </header>

        {isLoggedIn ? (
          <PostForm onPostCreated={handlePostCreated} />
        ) : (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6 text-center">
            <p className="text-gray-700">投稿するにはログインが必要です。</p>
            <Link href="/login" className="text-blue-500 hover:underline font-bold mt-2 inline-block">ログインページへ</Link>
          </div>
        )}

        {/* --- 方言ガチャUI --- */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 text-center sticky top-2 z-10">
          <p className="text-sm text-gray-600">現在の表示</p>
          <p className="text-2xl font-bold text-indigo-600">{currentDialect}</p>
          <button 
            onClick={handleGacha}
            disabled={isTranslating || isLoading}
            className="mt-2 bg-green-500 text-white font-bold py-2 px-6 rounded-full hover:bg-green-600 disabled:bg-gray-400 transition"
          >
            {isTranslating ? '変換中...' : '方言ガチャを回す！'}
          </button>
        </div>

        <div className="space-y-4">
          {isLoading && <p className="text-center">タイムラインを読み込み中...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          
          {!isLoading && !error && posts.map((post) => {
            const postKey = `post-${post.id}`;
            const postDisplayText = translatedTexts[postKey] || post.original_text;
            return(
              <div key={post.id} className="bg-white p-4 sm:p-5 rounded-lg shadow">
                <p className="text-gray-800 whitespace-pre-wrap">{postDisplayText}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(post.created_at).toLocaleString('ja-JP')}</p>
                
                {post.replies.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {post.replies.map((reply) => {
                      const replyKey = `reply-${reply.id}`;
                      const replyDisplayText = translatedTexts[replyKey] || reply.original_text;
                      return (
                        <div key={reply.id} className="bg-gray-50 p-3 rounded-md border-l-4 border-gray-200">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{replyDisplayText}</p>
                          <p className="text-xs text-gray-400 mt-1 text-right">{new Date(reply.created_at).toLocaleString('ja-JP')}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  );
}