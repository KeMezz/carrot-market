import type { NextPage } from "next";
import { useRouter } from "next/router";
import FloatingBtn from "../components/atom/floatingBtn";
import Layout from "../components/template/layout";
import Product from "../components/molecule/product";

const Home: NextPage = () => {
  const { push } = useRouter();
  const goToUpload = () => push("/items/upload");
  return (
    <Layout title="홈">
      <div className="divide-y">
        {Array.from({ length: 10 }, (_, i) => i).map((i) => (
          <Product key={i} />
        ))}
      </div>
      <FloatingBtn onClick={goToUpload} />
    </Layout>
  );
};

export default Home;
