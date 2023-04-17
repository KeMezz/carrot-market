import { NextPage } from "next";
import GridProduct from "@components/molecule/grid-product";
import Layout from "@components/template/layout";
import Profile from "@components/molecule/profile";
import FilledBtn from "@components/atom/filled-btn";
import { useRouter } from "next/router";
import useSWR from "swr";
import { Product } from "@prisma/client";

interface ProductDetailResponse {
  success: boolean;
  relatedProducts: Product[];
  product: {
    user: {
      id: number;
      name: string;
      avatar: string;
    };
  } & Product;
}

const ItemDetail: NextPage = () => {
  const router = useRouter();
  console.log(router.query);
  const { data } = useSWR<ProductDetailResponse>(
    router.query.id ? `/api/products/${router.query.id}` : null
  );
  console.log(data);
  return (
    <Layout canGoBack title={data?.product.name}>
      <section className="p-4 ">
        <div className="border-b">
          <div className="w-full h-96 bg-slate-300 rounded-md" />
          <Profile
            userId={data?.product.userId!}
            name={data?.product.user.name!}
          />
        </div>
        <div className="flex flex-col gap-4 py-4 my-4">
          <h2 className="text-3xl font-bold">{data?.product.name}</h2>
          <h3 className="text-xl">${data?.product.price}</h3>
          <p>{data?.product.description}</p>
          <div className="flex items-center gap-4">
            <FilledBtn title="Talk to seller" />
            <div className="flex justify-center w-8 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </div>
          </div>
        </div>
        {data?.relatedProducts ? (
          <div className="mt-8">
            <h3 className="text-2xl font-semibold">Similar items</h3>
            <div className="grid grid-cols-2 py-4 gap-4">
              {data?.relatedProducts.map((product) => (
                <GridProduct
                  key={product.id}
                  productId={product.id}
                  title={product.name}
                  price={product.price}
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
