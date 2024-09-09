import React, { useState, useEffect } from 'react';
import withAuthAdmin from '../../hoc/withAuthAdmin';
import { adminDb } from '../../adminFirebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  isPublished: boolean;
  createdAt: string | null; // 日付を文字列に変更
  updatedAt: string | null; // 日付を文字列に変更
}

const Admin = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  // Firestoreからブログ投稿を取得する関数
  const fetchPosts = async () => {
    const querySnapshot = await getDocs(collection(adminDb, 'blogPosts'));
    const posts = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        content: data.content,
        isPublished: data.isPublished,
        createdAt: data.createdAt ? data.createdAt.toDate().toLocaleString() : null, // TimestampをDateに変換
        updatedAt: data.updatedAt ? data.updatedAt.toDate().toLocaleString() : null, // TimestampをDateに変換
      };
    }) as BlogPost[];
    setBlogPosts(posts);
  };

  useEffect(() => {
    // ページロード時に投稿を取得
    fetchPosts();
  }, []);

  // ブログ投稿をFirestoreに追加または編集する関数
  const addOrUpdatePost = async () => {
    if (editId) {
      // 編集モードの場合、Firestoreのドキュメントを更新
      const postRef = doc(adminDb, 'blogPosts', editId);
      await updateDoc(postRef, {
        title,
        content,
        isPublished,
        updatedAt: Timestamp.now(), // 更新日を現在時刻に更新
      });
      setEditId(null);
    } else {
      // 新規追加
      await addDoc(collection(adminDb, 'blogPosts'), {
        title,
        content,
        isPublished,
        createdAt: Timestamp.now(), // 作成日
        updatedAt: Timestamp.now(), // 作成時に同じタイムスタンプを使用
      });
    }
    setTitle('');
    setContent('');
    setIsPublished(false);
    // 投稿を再取得
    fetchPosts();
  };

  // 投稿の編集を開始する関数
  const editPost = (post: BlogPost) => {
    setTitle(post.title);
    setContent(post.content);
    setIsPublished(post.isPublished);
    setEditId(post.id);
  };

  // 投稿を削除する関数
  const deletePost = async (id: string) => {
    const postRef = doc(adminDb, 'blogPosts', id);
    await deleteDoc(postRef);
    fetchPosts(); // 削除後に再度投稿を取得
  };

  // 新規投稿モードに戻る関数
  const resetToAddNewPost = () => {
    setTitle('');
    setContent('');
    setIsPublished(false);
    setEditId(null);
  };

  return (
    <>
      <h1>記事編集画面</h1>

      <div className='createbox'>
        <div className='publishbox'>
          <h2>{editId ? '記事編集中' : '新規記事作成中'}</h2>
          <label>
            <input
              type="checkbox"
              checked={isPublished}
              onChange={() => setIsPublished(!isPublished)}
            />
            公開
          </label>
          {/* 新規投稿モードに戻すボタン */}
          {editId && (
            <button onClick={resetToAddNewPost}>
              新規記事追加
            </button>
          )}
        </div>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button onClick={addOrUpdatePost}>
          {editId ? 'Update Post' : 'Add Post'}
        </button>
      </div>

      <div className='postslist'>
        {blogPosts.map((post) => (
          <div key={post.id} className='posts'>
            <h2>{post.title}</h2>
            <p style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
            <p>作成日: {post.createdAt ? post.createdAt : 'N/A'}</p>
            <p>更新日: {post.updatedAt ? post.updatedAt : 'N/A'}</p>
            <div className='postsbutton'>
                <button className='postedit' onClick={() => editPost(post)}>Edit</button>
                <button className='postdelete' onClick={() => deletePost(post.id)}>Delete</button>
                <Link
                  href={
                    post.isPublished
                      ? `/${post.id}` // 公開済みの記事の通常URL
                      : `/${post.id}?preview=true` // プレビュー用のURL
                  }
                  target="_blank"
                >
                  {post.isPublished ? 'View' : 'Preview'}
                </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default withAuthAdmin(Admin);
