import type { NextPage } from "next";
import FloatingBtn from "@components/atom/floating-btn";
import Layout from "@components/template/layout";
import ProductCard from "@components/molecule/product-card";
import useUser from "@libs/client/useUser";
import useSWR from "swr";
import { Product } from "@prisma/client";
import Link from "next/link";
import Pagination from "@components/molecule/pagination";
import { useRouter } from "next/router";
import SkProductCard from "@components/skeleton/skeleton-product-card";

interface ProductWithCounts extends Product {
  _count: {
    records: number;
    chatRooms: number;
  };
}

interface ProductsResponse {
  success: boolean;
  products: ProductWithCounts[];
  totalCount: number;
}

const Home: NextPage = () => {
  const router = useRouter();
  const { error } = useUser();
  const { data, isLoading } = useSWR<ProductsResponse>("/api/products");
  if ((data && !data.success) || (data && error)) {
    return null;
  }
  return (
    <Layout title="홈">
      {!isLoading
        ? null
        : Array.from({ length: 4 }, (_, i) => i).map((i) => (
            <SkProductCard key={i} />
          ))}
      {data?.products.length === 0 ? (
        <section className="flex min-h-[calc(100vh-152px)]">
          <div className="flex flex-col gap-4 justify-center items-center text-gray-400 m-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-20 h-20"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
              />
            </svg>
            <p>첫 중고 거래글을 등록해보세요!</p>
          </div>
        </section>
      ) : (
        <div className="flex flex-col divide-y">
          {data?.products.map((product) => (
            <ProductCard
              id={product.id}
              key={product.id}
              title={product.name}
              price={product.price}
              heart={product._count.records}
              image={product.image}
              comment={product._count.chatRooms}
            />
          ))}
          <Pagination
            page={Number(router.query.page)}
            totalCount={data?.totalCount!}
          />
        </div>
      )}
      <Link href="/products/upload">
        <FloatingBtn d="M12 4.5v15m7.5-7.5h-15" />
      </Link>
    </Layout>
  );
};

export default Home;
