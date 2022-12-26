import Layout from "../../components/layout";
import SubmitBtn from "../../components/submitBtn";
import Textarea from "../../components/textarea";
import TextInput from "../../components/textInput";

const Upload = () => {
  return (
    <Layout canGoBack>
      <div className="p-4 space-y-4">
        <label htmlFor="file">
          <div className="my-12 h-56 border-dashed w-full border-2 border-slate-300 rounded-md flex justify-center items-center cursor-pointer hover:border-slate-700">
            <svg
              className="h-12 w-12"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </label>
        <input type="file" className="hidden" id="file" />
        <section className="space-y-4">
          <TextInput
            name="상품명"
            placeholder="상품명을 입력해주세요"
            id="name"
          />
          <TextInput
            name="가격"
            placeholder="0"
            sign="$"
            unit="USD"
            id="price"
          />
          <Textarea name="설명" id="description" />
        </section>
        <SubmitBtn title="상품 업로드" />
      </div>
    </Layout>
  );
};

export default Upload;
