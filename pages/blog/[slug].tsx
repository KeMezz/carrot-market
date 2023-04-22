import Layout from "@components/template/layout";
import { readFileSync, readdirSync } from "fs";
import matter from "gray-matter";
import { GetStaticProps, NextPage, NextPageContext } from "next";
import remarkHtml from "remark-html";
import remarkParse from "remark-parse";
import { unified } from "unified";

interface PostProps {
  post: string;
}

const Post: NextPage<PostProps> = ({ post }) => {
  return <Layout title="h1">{post}</Layout>;
};

export function getStaticPaths() {
  // telling next.js which pages to generate.
  // because these pages need to be statically generated, besides these wil get dynamic [slug] url.
  const fileNames = readdirSync("./posts");
  const postSlugs = fileNames.map((fileName) => {
    const content = readFileSync(`./posts/${fileName}`, { encoding: "utf-8" });
    return { params: { slug: matter(content).data.slug } };
  });
  return {
    paths: [...postSlugs],
    fallback: false,
  };
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const fileNames = readdirSync("./posts");
  const match = fileNames.filter((fileName) => {
    const content = readFileSync(`./posts/${fileName}`, { encoding: "utf-8" });
    const {
      data: { slug },
    } = matter(content);
    return slug === ctx.params?.slug;
  });
  const { content } = matter.read(`./posts/${match[0]}`);
  const { value: post } = await unified()
    .use(remarkParse)
    .use(remarkHtml)
    .process(content);

  return {
    props: { post },
  };
};

export default Post;
