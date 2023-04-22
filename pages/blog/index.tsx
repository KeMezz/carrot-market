import Layout from "@components/template/layout";
import { readFileSync, readdirSync } from "fs";
import matter from "gray-matter";
import { NextPage } from "next";
import Link from "next/link";

interface Post {
  title: string;
  date: string;
  category: string;
  slug: string;
}

const Blog: NextPage<{ posts: Post[] }> = ({ posts }) => {
  return (
    <Layout title="Blog">
      <h1 className="text-lg font-bold p-3">Latest Posts</h1>
      <ul className="divide-y">
        {posts.map((post, index) => (
          <Link key={index} href={`/blog/${post.slug}`}>
            <div className="h-24 flex flex-col p-3">
              <h5 className="font-medium">{post.title}</h5>
              <div>
                <span>
                  {post.date} {post.category}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </ul>
    </Layout>
  );
};

export async function getStaticProps() {
  const blogPosts = readdirSync("./posts").map((file) => {
    const content = readFileSync(`./posts/${file}`, { encoding: "utf-8" });
    return matter(content).data;
  });
  return {
    props: {
      posts: JSON.parse(JSON.stringify(blogPosts)),
    },
  };
}

export default Blog;
