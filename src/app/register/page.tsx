'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as apiClient from '@/lib/apiClient';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
          // APIクライアントを使ってユーザー登録処理を実行
          await apiClient.register(username, password);

          // 登録成功後、ログインページにメッセージ付きでリダイレクト
          router.push('/login?registered=true');

        } catch (err) { // anyを削除 (または unknown を指定)
          // エラーがErrorインスタンスか確認し、安全にmessageプロパティにアクセスする
          if (err instanceof Error) {
            setError(err.message || '登録に失敗しました。');
          } else {
            // 予期せぬ形式のエラーの場合
            setError('登録に失敗しました。');
          }
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">新規登録</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              ユーザー名
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-gray-400"
            >
              {isLoading ? '登録中...' : '登録する'}
            </button>
          </div>
        </form>
        <p className="text-center text-gray-500 text-xs mt-6">
          すでにアカウントをお持ちですか？{' '}
          <Link href="/login" className="text-blue-500 hover:underline">
            ログインはこちら
          </Link>
        </p>
      </div>
    </main>
  );
}