import FilledBtn from "@components/atom/filled-btn";
import Textarea from "@components/atom/textarea";
import Layout from "@components/template/layout";
import useCoords from "@libs/client/useCoords";
import useMutation from "@libs/client/useMutation";
import { Post } from "@prisma/client";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface WriteForm {
  question: string;
}

interface WriteResponse {
  success: boolean;
  post: Post;
}

const Write: NextPage = () => {
  const { latitude, longitude } = useCoords();
  const { register, handleSubmit } = useForm<WriteForm>();
  const [post, { loading, data }] = useMutation<WriteResponse>("/api/posts");
  const onValid = (data: WriteForm) => {
    if (loading) return;
    post({ ...data, latitude, longitude });
  };

  const router = useRouter();
  useEffect(() => {
    console.log(data);
    if (data && data.success) {
      router.push(`/community/${data?.post.id}`);
    }
  }, [router, data]);

  return (
    <Layout canGoBack title="질문 작성하기">
      <form
        className="p-4 flex flex-col gap-4"
        onSubmit={handleSubmit(onValid)}
      >
        <Textarea
          id="answer"
          register={register("question", { required: true })}
          placeholder="Ask a question!"
        />
        <FilledBtn title={loading ? "Loading..." : "Submit"} />
      </form>
    </Layout>
  );
};

export default Write;
