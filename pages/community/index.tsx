import { NextPage } from "next";
import FloatingBtn from "@components/atom/floating-btn";
import CommunityPost from "@components/molecule/community-post";
import Layout from "@components/template/layout";
import Link from "next/link";
import useSWR from "swr";
import { Post } from "@prisma/client";

interface UserEssential {
  id: number;
  name: string;
  avatar: string;
}

interface PostWithUser extends Post {
  user: UserEssential;
  _count: { answers: number; interests: number };
}

interface PostsResponse {
  success: boolean;
  posts: PostWithUser[];
  isInterest: boolean;
}

const Community: NextPage = () => {
  const { data } = useSWR<PostsResponse>(`/api/posts`);
  console.log(data);

  return (
    <Layout title="동네생활">
      <section>
        {data?.posts?.map((post) => (
          <CommunityPost
            key={post?.id}
            postId={post.id}
            user={post?.user?.name}
            createdAt={new Date(post?.createdAt)}
            question={post?.question}
            interestCount={post?._count?.interests}
            answerCount={post?._count?.answers}
          />
        ))}
      </section>
      <Link href="/community/write">
        <FloatingBtn d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
      </Link>
    </Layout>
  );
};

export default Community;
