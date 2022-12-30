import { NextPage } from "next";
import SubmitBtn from "../../components/atom/submitBtn";
import Textarea from "../../components/atom/textarea";
import TextInput from "../../components/atom/textInput";
import Layout from "../../components/template/layout";

const UploadStream: NextPage = () => {
  return (
    <Layout canGoBack>
      <section className="flex flex-col gap-4 p-4 mt-8">
        <TextInput name="상품명" id="name" />
        <TextInput name="가격" id="price" />
        <Textarea name="설명" id="description" />
        <SubmitBtn title="Go live" />
      </section>
    </Layout>
  );
};

export default UploadStream;