'use client';

import { useEffect, useState, useCallback } from 'react';
import { Post } from '@/types';
import * as apiClient from '@/lib/apiClient';
import PostForm from '@/componenrs/PostForm';
import PostThread from '@/componenrs/PostThread'; // ★PostThreadをインポート
import Link from 'next/link';
import { DIALECTS } from '@/constants/dialects';

// ... (このファイルの上半分は、前回から変更ありません) ...
// 方言ガチャ関連のStateや関数の定義はそのままです
type TranslatedTexts = Record<string, string>;

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentDialect, setCurrentDialect] = useState('標準語');
  const [translatedTexts, setTranslatedTexts] = useState<TranslatedTexts>({});
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) setIsLoggedIn(true);

    const fetchTimeline = async () => {
      try {
        const timelinePosts = await apiClient.getTimeline();
        setPosts(timelinePosts);
      } catch (err) {
        setError('タイムラインの読み込みに失敗しました。');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimeline();
  }, []);

  const handlePostCreated = (newPost: Post) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };
  
  // ... (handleGacha関数と自動更新useEffectも変更なし) ...
  const handleGacha = useCallback(async () => {
    if (posts.length === 0) return;
    setIsTranslating(true);
    
    const otherDialects = DIALECTS.filter(d => d !== currentDialect);
    const newDialect = otherDialects[Math.floor(Math.random() * otherDialects.length)];
    
    const requestItems = posts.flatMap(post => [
      { type: 'post' as const, id: post.id, text: post.original_text },
      ...post.replies.map(reply => ({ type: 'reply' as const, id: reply.id, text: reply.original_text }))
    ]);

    try {
      const response = await apiClient.translateTexts({ dialect: newDialect, texts: requestItems });
      
      const newTranslations: TranslatedTexts = {};
      response.results.forEach(item => {
        const key = `${item.type}-${item.id}`;
        newTranslations[key] = item.translated_text;
      });

      setTranslatedTexts(newTranslations);
      setCurrentDialect(newDialect);

    } catch (err) {
      setError('方言への変換に失敗しました。');
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  }, [posts, currentDialect]);

  useEffect(() => {
    if(posts.length > 0){
      const intervalId = setInterval(handleGacha, 60000);
      return () => clearInterval(intervalId);
    }
  }, [posts.length, handleGacha]);


  // ★ここから下のreturn文の中がシンプルになります
  return (
    <main className="bg-gray-100 min-h-screen">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* ... (header, PostForm, DialectGachaUIは変更なし) ... */}
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
          
          {/* ★★★ 変更点 ★★★ */}
          {/* 複雑な表示ロジックをPostThreadコンポーネントに委任 */}
          {!isLoading && !error && posts.map((post) => (
            <PostThread 
              key={post.id} 
              post={post} 
              isLoggedIn={isLoggedIn}
              translatedTexts={translatedTexts} // ★ この行を追加
            />
          ))}

        </div>
      </div>
    </main>
  );
}