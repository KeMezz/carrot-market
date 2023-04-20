import { NextPage } from "next";
import FilledBtn from "@components/atom/filled-btn";
import Textarea from "@components/atom/textarea";
import TextInput from "@components/atom/text-input";
import Layout from "@components/template/layout";
import { useForm } from "react-hook-form";
import useMutation from "@libs/client/useMutation";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { Stream } from "@prisma/client";

interface UploadStreamForm {
  name: string;
  price: string;
  description: string;
}

interface StreamResponse {
  success: boolean;
  stream: Stream;
}

const UploadStream: NextPage = () => {
  const { register, handleSubmit } = useForm<UploadStreamForm>();
  const [uploadStream, { loading, data }] =
    useMutation<StreamResponse>(`/api/streams`);
  const onValid = (data: UploadStreamForm) => {
    if (loading) return;
    uploadStream(data);
  };
  const router = useRouter();

  useEffect(() => {
    if (data && data.success) {
      router.push(`/streams/${data.stream.id}`);
    }
  }, [data, router]);

  return (
    <Layout canGoBack>
      <form
        className="flex flex-col gap-4 p-4 mt-8"
        onSubmit={handleSubmit(onValid)}
      >
        <TextInput
          name="상품명"
          id="name"
          type="text"
          register={register("name", { required: true })}
        />
        <TextInput
          name="가격"
          id="price"
          type="number"
          register={register("price", { required: true, valueAsNumber: true })}
        />
        <Textarea
          name="설명"
          id="description"
          register={register("description", { required: true })}
        />
        <FilledBtn title="Go live" />
      </form>
    </Layout>
  );
};

export default UploadStream;
