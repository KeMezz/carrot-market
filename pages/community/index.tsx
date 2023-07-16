import { NextPage } from "next";
import FloatingBtn from "@components/atom/floating-btn";
import CommunityPost from "@components/molecule/community-post";
import Layout from "@components/template/layout";
import useSWR from "swr";
import { Post } from "@prisma/client";
import SkProductCard from "@components/skeleton/skeleton-product-card";
import { useRouter } from "next/router";

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
              <SkProductCard key={i} />
            ))}
        {data?.posts.length === 0 ? (
          <div className="flex flex-col gap-4 justify-center items-center min-h-[calc(100vh-152px)] text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-20 h-20"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
              />
            </svg>
            <h3>커뮤니티의 첫 글을 작성해주세요!</h3>
          </div>
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
