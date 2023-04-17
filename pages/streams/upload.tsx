import { NextPage } from "next";
import FilledBtn from "@components/atom/filled-btn";
import Textarea from "@components/atom/textarea";
import TextInput from "@components/atom/text-input";
import Layout from "@components/template/layout";
import { useForm } from "react-hook-form";

const UploadStream: NextPage = () => {
  const { register } = useForm();
  return (
    <Layout canGoBack>
      <section className="flex flex-col gap-4 p-4 mt-8">
        <TextInput
          name="상품명"
          id="name"
          type="text"
          register={register("name")}
        />
        <TextInput
          name="가격"
          id="price"
          type="number"
          register={register("price")}
        />
        <Textarea name="설명" id="description" />
        <FilledBtn title="Go live" />
      </section>
    </Layout>
  );
};

export default UploadStream;
