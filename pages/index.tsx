import type { NextPage } from "next";
import { useRouter } from "next/router";
import FloatingBtn from "@components/atom/floating-btn";
import Layout from "@components/template/layout";
import Product from "@components/molecule/product";
import useUser from "@libs/client/useUser";

const Home: NextPage = () => {
  const router = useRouter();
  const goToUpload = () => router.push("/products/upload");
  const { user, isLoading } = useUser();
  return (
    <Layout title="홈">
      <div className="divide-y">
        {Array.from({ length: 10 }, (_, i) => i).map((i) => (
          <Product
            key={i}
            title="iPhone 14 Pro Max"
            color="Black"
            price={999}
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
