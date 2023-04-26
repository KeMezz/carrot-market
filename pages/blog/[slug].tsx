import Layout from "@components/template/layout";
import { readFileSync, readdirSync } from "fs";
import matter from "gray-matter";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import remarkHtml from "remark-html";
import remarkParse from "remark-parse";
import { unified } from "unified";

interface PostProps {
  post: string;
  data: {
    title: string;
    date: string;
    cateogry: string;
    slug: string;
  };
}

const Post: NextPage<PostProps> = ({ post, data }) => {
  return (
    <Layout title={data.title}>
      <article dangerouslySetInnerHTML={{ __html: post }} />
    </Layout>
  );
};

export function getStaticPaths() {
  // telling next.js which pages to generate.
  // because these pages need to be statically generated, besides these wil get dynamic [slug] url.
  return {
    paths: [],
    fallback: "blocking",
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
  const { content, data } = matter.read(`./posts/${match[0]}`);
  const { value: post } = await unified()
    .use(remarkParse)
    .use(remarkHtml)
    .process(content);

  return {
    props: { post, data: JSON.parse(JSON.stringify(data)) },
  };
};

export default Post;
