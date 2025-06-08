import { Suspense } from 'react';
import LoginForm from '@/componenrs/LoginForm';

// ローディング中に表示するシンプルなコンポーネント
function LoadingFallback() {
  return (
    <div className="w-full max-w-md text-center">
      <p>読み込み中...</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense fallback={<LoadingFallback />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}