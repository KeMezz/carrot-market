import { NextPage } from "next";
import GridProduct from "@components/molecule/grid-product";
import Layout from "@components/template/layout";
import Profile from "@components/molecule/profile";
import FilledBtn from "@components/atom/filled-btn";
import { useRouter } from "next/router";
import useSWR from "swr";
import { Product } from "@prisma/client";
import useMutation from "@libs/client/useMutation";
import { cls } from "@libs/client/utils";

interface ProductDetailResponse {
  success: boolean;
  relatedProducts: Product[];
  product: {
    user: {
      id: number;
      name: string;
      avatar: string | null;
    };
  } & Product;
  isLiked: boolean;
}

const ItemDetail: NextPage = () => {
  const router = useRouter();
  const { data, mutate: boundMutate } = useSWR<ProductDetailResponse>(
    router.query.id ? `/api/products/${router.query.id}` : null
  );
  const [toggleFav] = useMutation(`/api/products/${router.query.id}/fav`);
  const onFavClick = () => {
    toggleFav({});
    if (!data) return;
    boundMutate((prev) => prev && { ...prev, isLiked: !data.isLiked }, false);
  };

  return (
    <Layout canGoBack title={data?.product.name}>
      <section className="p-4">
        <div className="border-b">
          {data?.product.image ? (
            <img
              src={
                data
                  ? `https://imagedelivery.net/bNh-NL16qgpnc_aca1vxPw/${data?.product.image}/public`
                  : ""
              }
              className="w-full bg-slate-300 rounded-md mx-auto"
            />
          ) : (
            <div className="w-full h-96 bg-slate-300 rounded-md" />
          )}
          <Profile
            avatar={data?.product.user.avatar ?? null}
            userId={data?.product.userId!}
            name={data?.product.user.name!}
          />
        </div>
        <div className="flex flex-col gap-4 py-4 my-4">
          <h2 className="text-3xl font-bold">{data?.product.name}</h2>
          <h3 className="text-xl">${data?.product.price}</h3>
          <p>{data?.product.description}</p>
          <div className="flex items-center gap-2">
            <FilledBtn title="Talk to seller" />
            <button
              onClick={onFavClick}
              className={cls(
                "flex justify-center p-2 rounded-md",
                data?.isLiked
                  ? "text-red-400 hover:bg-red-100"
                  : "text-gray-400 hover:bg-gray-100"
              )}
            >
              {data?.isLiked ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
        {data && data.relatedProducts.length > 0 ? (
          <div className="mt-8">
            <h3 className="text-2xl font-semibold">Similar items</h3>
            <div className="grid grid-cols-2 py-4 gap-4">
              {data?.relatedProducts.map((product) => (
                <GridProduct
                  key={product.id}
                  productId={product.id}
                  title={product.name}
                  price={product.price}
                  image={product.image}
                />
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </Layout>
  );
};

export default ItemDetail;
