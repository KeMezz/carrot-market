import type { NextPage } from "next";
import { useRouter } from "next/router";
import FloatingBtn from "@components/atom/floating-btn";
import Layout from "@components/template/layout";
import ProductCard from "@components/molecule/product";
import useUser from "@libs/client/useUser";
import useSWR from "swr";
import { Product } from "@prisma/client";

interface ProductsResponse {
  success: boolean;
  products: Product[];
}

const Home: NextPage = () => {
  const router = useRouter();
  const goToUpload = () => router.push("/products/upload");
  const { user, isLoading } = useUser();
  const { data } = useSWR<ProductsResponse>("/api/products");
  console.log(data);
  return (
    <Layout title="홈">
      <div className="divide-y">
        {data?.products.map((product) => (
          <ProductCard
            key={product.id}
            title={product.name}
            color="Black"
            price={product.price}
            heart={1}
            comment={1}
          />
        ))}
      </div>
      <FloatingBtn onClick={goToUpload} d="M12 4.5v15m7.5-7.5h-15" />
    </Layout>
  );
};

export default Home;
