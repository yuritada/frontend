'use client';

import { useEffect, useState } from 'react';
// ★ useRouter と Link をインポートしている行から useRouter を削除
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import * as apiClient from '@/lib/apiClient';

export default function LoginForm() {
  // ★ const router = useRouter(); の行を完全に削除
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('ユーザー登録が完了しました。ログインしてください。');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const data = await apiClient.login(username, password);
      localStorage.setItem('accessToken', data.access_token);
      // この部分は変更なし (router を使っていない)
      window.location.href = '/';
    } catch (err) {
      setError('ユーザー名またはパスワードが正しくありません。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">ログイン</h1>
      
      {successMessage && <p className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{successMessage}</p>}

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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-gray-400"
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </div>
      </form>

      <p className="text-center text-gray-500 text-xs mt-6">
        アカウントをお持ちでないですか？{' '}
        <Link href="/register" className="text-blue-500 hover:underline">
          新規登録はこちら
        </Link>
      </p>
    </div>
  );
}