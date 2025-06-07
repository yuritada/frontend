import { Post, Reply, Token, User } from '@/types';

// .env.localで定義したバックエンドAPIのURLを取得
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// API通信におけるエラーを表現するカスタムエラー
class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// --- 認証関連 API ---

/**
 * ユーザー名とパスワードでログインし、JWTトークンを取得する
 */
export const login = async (username: string, password: string): Promise<Token> => {
  // FastAPIのOAuth2PasswordRequestFormは'application/x-www-form-urlencoded'を期待するため、
  // URLSearchParamsを使ってデータを整形する
  const body = new URLSearchParams();
  body.append('username', username);
  body.append('password', password);

  const response = await fetch(`${API_BASE_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new ApiError(errorData.detail || 'Login failed', response.status);
  }
  return response.json();
};

/**
 * 新規ユーザーを登録する
 */
export const register = async (username: string, password: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new ApiError(errorData.detail || 'Registration failed', response.status);
  }
  return response.json();
};


// --- 投稿・タイムライン関連 API ---

/**
 * タイムラインの投稿データを取得する
 */
export const getTimeline = async (): Promise<Post[]> => {
  const response = await fetch(`${API_BASE_URL}/posts/timeline`);
  if (!response.ok) {
    throw new ApiError('Failed to fetch timeline', response.status);
  }
  return response.json();
};

/**
 * 新しい投稿を作成する
 * @param text 投稿の本文
 * @param token 認証用のJWTトークン
 */
export const createPost = async (text: string, token: string): Promise<Post> => {
  const response = await fetch(`${API_BASE_URL}/posts/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // 認証ヘッダーを追加
    },
    body: JSON.stringify({ original_text: text }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new ApiError(errorData.detail || 'Failed to create post', response.status);
  }
  return response.json();
};

/**
 * 新しい返信を作成する
 * @param postId 返信先の投稿ID
 * @param text 返信の本文
 * @param token 認証用のJWTトークン
 */
export const createReply = async (postId: number, text: string, token: string): Promise<Reply> => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/replies`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ original_text: text }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(errorData.detail || 'Failed to create reply', response.status);
    }
    return response.json();
}

// src/lib/apiClient.ts の末尾に追記
import { TranslationRequest, TranslationResponse } from '@/types'; // ファイル上部のimportに追加

/**
 * テキスト群を指定された方言に翻訳する
 * @param request 翻訳したい方言とテキストのデータ
 */
export const translateTexts = async (request: TranslationRequest): Promise<TranslationResponse> => {
  const response = await fetch(`${API_BASE_URL}/translate/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new ApiError(errorData.detail || 'Failed to translate texts', response.status);
  }
  return response.json();
};