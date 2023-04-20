import Layout from "@components/template/layout";
import FilledBtn from "@components/atom/filled-btn";
import Textarea from "@components/atom/textarea";
import TextInput from "@components/atom/text-input";
import { useForm } from "react-hook-form";
import useMutation from "@libs/client/useMutation";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Product } from "@prisma/client";
import useImageId from "@libs/client/useImageId";
import Image from "next/image";

interface UploadProductForm {
  name: string;
  price: string;
  description: string;
  image: FileList;
}

interface UploadProductMutation {
  success: boolean;
  product: Product;
}

const Upload = () => {
  const { register, handleSubmit, watch } = useForm<UploadProductForm>();
  const [uploadProduct, { loading: formUploadLoading, data }] =
    useMutation<UploadProductMutation>("/api/products");
  const [getImageId, { loading: imageUploadLoading }] = useImageId();
  const loading = formUploadLoading || imageUploadLoading;

  const onValid = async ({
    name,
    price,
    description,
    image,
  }: UploadProductForm) => {
    if (loading) return;
    if (image && image.length > 0) {
      const imageId = await getImageId({ fileList: image, fileName: name });
      console.log(imageId);
      return uploadProduct({ name, price, description, image: imageId });
    }
    return uploadProduct({ name, price, description });
  };

  const watchImage = watch("image");
  const [previewImage, setPreviewImage] = useState("");
  useEffect(() => {
    if (watchImage && watchImage.length > 0) {
      setPreviewImage(URL.createObjectURL(watchImage[0]));
    }
  }, [watchImage]);

  const router = useRouter();
  useEffect(() => {
    if (data?.success) {
      router.push(`/products/${data.product.id}`);
    }
  }, [data, router]);

  return (
    <Layout canGoBack>
      <form className="p-4 space-y-4" onSubmit={handleSubmit(onValid)}>
        <label htmlFor="file" className="cursor-pointer">
          {previewImage ? (
            <div className="relative h-80 hover:bg-gray-100 transition-colors rounded-lg">
              <Image
                alt="미리보기 이미지"
                fill
                className="w-full rounded-md mx-auto object-contain"
                src={previewImage}
              />
            </div>
          ) : (
            <div className="my-12 h-56 border-dashed w-full border-2 border-slate-300 rounded-md flex justify-center items-center hover:border-orange-400 hover:text-orange-400 hover:bg-orange-100">
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
          )}
        </label>
        <input
          type="file"
          className="hidden"
          id="file"
          accept="image/*"
          {...register("image", { required: true })}
        />
        <section className="space-y-4">
          <TextInput
            name="상품명"
            placeholder="상품명을 입력해주세요"
            id="name"
            type="text"
            register={register("name", { required: "상품명을 입력해주세요." })}
          />
          <TextInput
            name="가격"
            type="number"
            placeholder="0"
            sign="$"
            unit="USD"
            id="price"
            register={register("price", { required: "가격을 입력해주세요." })}
          />
          <Textarea
            name="설명"
            id="description"
            register={register("description", {
              required: "상품 설명을 입력해주세요.",
            })}
          />
        </section>
        <FilledBtn title={loading ? "Loading..." : "상품 업로드"} />
      </form>
    </Layout>
  );
};

export default Upload;
