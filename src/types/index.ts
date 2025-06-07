// backendのschemas.pyに対応するTypeScriptの型を定義します

export interface Reply {
  id: number;
  post_id: number;
  user_id: number;
  original_text: string;
  created_at: string; // 日付は文字列として受け取るのが一般的
}

export interface Post {
  id: number;
  user_id: number;
  original_text: string;
  created_at: string;
  replies: Reply[];
}

export interface User {
  id: number;
  username: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// 翻訳リクエスト・レスポンスの型
export interface TranslationRequestItem {
  type: 'post' | 'reply';
  id: number;
  text: string;
}

export interface TranslationRequest {
  dialect: string;
  texts: TranslationRequestItem[];
}

export interface TranslationResponseItem {
  type: 'post' | 'reply';
  id: number;
  translated_text: string;
}

export interface TranslationResponse {
  results: TranslationResponseItem[];
}