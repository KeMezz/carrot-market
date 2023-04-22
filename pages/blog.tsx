import Layout from "@components/template/layout";
import { readFileSync, readdirSync } from "fs";
import matter from "gray-matter";
import { NextPage } from "next";

interface Post {
  title: string;
  date: string;
  category: string;
}

const Blog: NextPage<{ posts: Post[] }> = ({ posts }) => {
  return (
    <Layout title="Blog">
      <h1>Latest Posts</h1>
      <ul>
        {posts.map((post, index) => (
          <div key={index} className="mb-8">
            <div>{post.title}</div>
            <div>
              <span>
                {post.date} {post.category}
              </span>
            </div>
          </div>
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
