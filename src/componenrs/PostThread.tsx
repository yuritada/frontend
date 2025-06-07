'use client';

import { useState } from 'react';
import { Post, Reply } from '@/types';
import ReplyForm from './ReplyFrom';

// ★ 親から翻訳済みテキストを受け取るための型を追加
type TranslatedTexts = Record<string, string>;

interface PostThreadProps {
  post: Post;
  isLoggedIn: boolean;
  translatedTexts: TranslatedTexts; // ★ PropsにtranslatedTextsを追加
}

export default function PostThread({ post, isLoggedIn, translatedTexts }: PostThreadProps) {
  const [replies, setReplies] = useState<Reply[]>(post.replies);

  const handleReplyCreated = (newReply: Reply) => {
    setReplies(prevReplies => [...prevReplies, newReply]);
  };

  // ★ 親投稿の表示テキストを決定するロジックを追加
  const postKey = `post-${post.id}`;
  const postDisplayText = translatedTexts[postKey] || post.original_text;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-lg shadow">
      {/* 親投稿の表示 */}
      <p className="text-gray-800 whitespace-pre-wrap">{postDisplayText}</p> {/* ★ 表示テキストを差し替え */}
      <p className="text-xs text-gray-400 mt-2">
        {new Date(post.created_at).toLocaleString('ja-JP')}
      </p>

      {/* 返信リストの表示 */}
      <div className="mt-4 space-y-3">
        {replies.map((reply) => {
          // ★ 返信の表示テキストを決定するロジックを追加
          const replyKey = `reply-${reply.id}`;
          const replyDisplayText = translatedTexts[replyKey] || reply.original_text;
          
          return (
            <div key={reply.id} className="bg-gray-50 p-3 rounded-md border-l-4 border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{replyDisplayText}</p> {/* ★ 表示テキストを差し替え */}
              <p className="text-xs text-gray-400 mt-1 text-right">
                {new Date(reply.created_at).toLocaleString('ja-JP')}
              </p>
            </div>
          )
        })}
      </div>

      {/* ログインしている場合のみ返信フォームを表示 */}
      {isLoggedIn && (
        <ReplyForm postId={post.id} onReplyCreated={handleReplyCreated} />
      )}
    </div>
  );
}