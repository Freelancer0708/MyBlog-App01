import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { adminDb } from '../adminFirebase';
import { useAuthContextAdmin } from '../contexts/AuthContextAdmin';
import { useEffect, useState } from 'react';

interface BlogPost {
  title: string;
  content: string;
  isPublished: boolean;
  createdAt: string | null;  // 作成日
  updatedAt: string | null;  // 更新日
}

const BlogPostPage = ({ post, isPreview }: { post: BlogPost | null, isPreview: boolean }) => {
  const router = useRouter();
  const { user } = useAuthContextAdmin(); // 認証状態を取得
  const [isAuthorized, setIsAuthorized] = useState(false); // 記事表示許可の状態

  useEffect(() => {
    if (user === undefined) {
      return;
    }

    // プレビュー中で、ユーザーが未ログインならリダイレクト
    if (!post?.isPublished && !user && isPreview) {
      router.replace('/404');
    } else {
      setIsAuthorized(true);
    }
  }, [user, post, isPreview, router]);

  if (!isAuthorized) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className='post'>
      <div className='posttitle'>
        <p>
            <span>作成日: {post.createdAt ? post.createdAt : 'N/A'}</span>
            <span>更新日: {post.updatedAt ? post.updatedAt : 'N/A'}</span>
        </p>
        <h1>{!post.isPublished && <span>Preview: </span>}{post.title}</h1>
      </div>
      <div className='postinner'>
        <p>{post.content}</p>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params!;
  const { preview } = context.query;
  const docRef = doc(adminDb, 'blogPosts', slug as string);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return {
      notFound: true,
    };
  }

  const post = docSnap.data();

  return {
    props: {
      post: {
        title: post?.title,
        content: post?.content,
        isPublished: post?.isPublished,
        createdAt: post?.createdAt ? post.createdAt.toDate().toLocaleString() : null,  // Timestampを文字列に変換
        updatedAt: post?.updatedAt ? post.updatedAt.toDate().toLocaleString() : null,  // Timestampを文字列に変換
      },
      isPreview: !!preview, // プレビュー用フラグ
    },
  };
};

export default BlogPostPage;
