import type { NextPage } from "next";
import FloatingBtn from "@components/atom/floating-btn";
import Layout from "@components/template/layout";
import ProductCard from "@components/molecule/product-card";
import useUser from "@libs/client/useUser";
import useSWR from "swr";
import { Product } from "@prisma/client";
import Link from "next/link";

interface ProductWithCounts extends Product {
  _count: {
    favs: number;
  };
}

interface ProductsResponse {
  success: boolean;
  products: ProductWithCounts[];
}

const Home: NextPage = () => {
  const { user, isLoading } = useUser();
  const { data } = useSWR<ProductsResponse>("/api/products");
  console.log(data);
  if (data && !data.success) {
    return null;
  }
  return (
    <Layout title="홈">
      <div className="flex flex-col divide-y">
        {data?.products.map((product) => (
          <ProductCard
            id={product.id}
            key={product.id}
            title={product.name}
            color="Black"
            price={product.price}
            heart={product._count.favs}
            comment={0}
          />
        ))}
      </div>
      <Link href="/products/upload">
        <FloatingBtn d="M12 4.5v15m7.5-7.5h-15" />
      </Link>
    </Layout>
  );
};

export default Home;
