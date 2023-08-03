import type { NextPage } from "next";
import Layout from "@components/template/layout";
import ProductCard from "@components/molecule/product-card";
import useUser from "@libs/client/useUser";
import useSWR from "swr";
import { Product } from "@prisma/client";
import Pagination from "@components/molecule/pagination";
import { useRouter } from "next/router";
import SkProductCard from "@components/skeleton/skeleton-product-card";
import Empty from "@components/organism/empty";

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
  const fibFn = () => {
    router.push("/products/upload");
  };
  return (
    <Layout title="홈" showFib fibFn={fibFn} fibIcon="add">
      {!isLoading
        ? null
        : Array.from({ length: 4 }, (_, i) => i).map((i) => (
            <SkProductCard key={i} />
          ))}
      {data?.products.length === 0 ? (
        <Empty text="첫 중고 거래 글을 등록해보세요!" />
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
    </Layout>
  );
};

export default Home;
