import { NextPage } from "next";
import CommunityPost from "@components/molecule/community-post";
import Layout from "@components/template/layout";
import useSWR from "swr";
import { Post } from "@prisma/client";
import { useRouter } from "next/router";
import SkCommunityPost from "@components/skeleton/skeleton-community-post";
import Empty from "@components/organism/empty";

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
  const router = useRouter();
  const { data, isLoading } = useSWR<PostsResponse>(`/api/posts`);
  const fibFn = () => {
    router.push("/community/write");
  };
  return (
    <Layout title="동네생활" showFib fibFn={fibFn} fibIcon="write">
      <section>
        {!isLoading
          ? null
          : Array.from({ length: 4 }, (_, i) => i).map((i) => (
              <SkCommunityPost key={i} />
            ))}
        {data?.posts.length === 0 ? (
          <Empty text="커뮤니티의 첫 글을 작성해주세요!" />
        ) : null}
        {data?.posts.map((post) => (
          <CommunityPost
            key={post?.id}
            postId={post.id}
            user={post?.user?.name}
            createdAt={post?.createdAt}
            question={post?.question}
            interestCount={post?._count?.interests}
            answerCount={post?._count?.answers}
          />
        ))}
      </section>
    </Layout>
  );
};

export default Community;
