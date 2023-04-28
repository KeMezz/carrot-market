import { NextPage } from "next";
import FloatingBtn from "@components/atom/floating-btn";
import CommunityPost from "@components/molecule/community-post";
import Layout from "@components/template/layout";
import Link from "next/link";
import useSWR from "swr";
import { Post } from "@prisma/client";
import SkProductCard from "@components/skeleton/skeleton-product-card";

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
  const { data, isLoading } = useSWR<PostsResponse>(`/api/posts`);
  return (
    <Layout title="동네생활">
      <section>
        {!isLoading
          ? null
          : Array.from({ length: 4 }, (_, i) => i).map((i) => (
              <SkProductCard key={i} />
            ))}
        {data?.posts.length === 0 ? (
          <div className="flex flex-col gap-4 justify-center items-center h-[85vh] text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-16 h-16"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
              />
            </svg>
            <h3>아직 동네에 올라온 글이 없어요</h3>
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
      <Link href="/community/write">
        <FloatingBtn d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
      </Link>
    </Layout>
  );
};

// export async function getStaticProps() {
//   console.log("BUILDING COMMUNITY STATICALLY..");
//   const posts = await client.post.findMany({
//     orderBy: {
//       createdAt: "desc",
//     },
//     include: {
//       user: {
//         select: {
//           id: true,
//           name: true,
//           avatar: true,
//         },
//       },
//       _count: {
//         select: {
//           interests: true,
//           answers: true,
//         },
//       },
//     },
//   });
//   return {
//     props: {
//       posts: JSON.parse(JSON.stringify(posts)),
//     },
//   };
// }

export default Community;
