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
      <div className={"flex flex-col divide-y"}>
        {!isLoading
          ? null
          : Array.from({ length: 4 }, (_, i) => i).map((i) => (
              <SkProductCard key={i} />
            ))}
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
      </div>
      <Pagination
        page={Number(router.query.page)}
        totalCount={data?.totalCount!}
      />
      <Link href="/products/upload">
        <FloatingBtn d="M12 4.5v15m7.5-7.5h-15" />
      </Link>
    </Layout>
  );
};

export default Home;
