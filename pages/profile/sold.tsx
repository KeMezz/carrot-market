import { NextPage } from "next";
import Product from "@components/molecule/product";
import Layout from "@components/template/layout";

const Sold: NextPage = () => {
  return (
    <Layout title="판매내역" canGoBack>
      <section className="divide-y">
        {Array.from({ length: 10 }, (_, i) => i).map((i) => (
          <Product key={i} />
        ))}
      </section>
    </Layout>
  );
};

export default Sold;
