import { collection, getDocs, query, where } from 'firebase/firestore';
import { adminDb } from '../adminFirebase';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  content: string; // 本文のフィールドを追加
  createdAt: string | null;  // 作成日
  updatedAt: string | null;  // 更新日
}

const Home = ({ blogPosts }: { blogPosts: BlogPost[] }) => {
  return (
    <div className='home'>
      <h1>投稿記事一覧</h1>
      <ul>
        {blogPosts.map((post) => (
          <li key={post.id}>
            <Link href={`/${post.id}`}>
              <h2>{post.title}</h2>
              <p>{post.content ? post.content.slice(0, 100) + '...' : 'No content available'}</p>
              <div className='postsdates'>
                <p>作成日: {post.createdAt ? post.createdAt : 'N/A'}</p>
                <p>更新日: {post.updatedAt ? post.updatedAt : 'N/A'}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const getServerSideProps = async () => {
  const q = query(collection(adminDb, 'blogPosts'), where('isPublished', '==', true));
  const querySnapshot = await getDocs(q);
  const posts = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      content: data.content, // 本文を取得
      createdAt: data.createdAt ? data.createdAt.toDate().toLocaleString() : null,  // Timestampを文字列に変換
      updatedAt: data.updatedAt ? data.updatedAt.toDate().toLocaleString() : null,  // Timestampを文字列に変換
    };
  });

  return {
    props: {
      blogPosts: posts,
    },
  };
};

export default Home;
