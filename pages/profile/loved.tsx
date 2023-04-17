import { NextPage } from "next";
import Product from "@components/molecule/product-card";
import Layout from "@components/template/layout";

const Loved: NextPage = () => {
  return (
    <Layout title="관심목록" canGoBack>
      <section className="divide-y">
        {Array.from({ length: 10 }, (_, i) => i).map((i) => (
          <Product key={i} />
        ))}
      </section>
    </Layout>
  );
};

export default Loved;
