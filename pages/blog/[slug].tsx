import Layout from "@components/template/layout";
import { readFileSync, readdirSync } from "fs";
import matter from "gray-matter";
import { NextPage } from "next";

const Post: NextPage = () => {
  return (
    <Layout title="h1">
      <h1>h1</h1>
    </Layout>
  );
};

export function getStaticPaths() {
  // telling next.js which pages to generate.
  // because these pages need to be statically generated, besides it wil get a dynamic [slug] url.
  const postSlugs = readdirSync("./posts").map((file) => {
    const content = readFileSync(`./posts/${file}`, { encoding: "utf-8" });
    return { params: { slug: matter(content).data.slug } };
  });
  return {
    paths: [...postSlugs],
    fallback: false,
  };
}

export function getStaticProps() {
  return {
    props: {},
  };
}

export default Post;
