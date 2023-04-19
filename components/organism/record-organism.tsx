import ProductCard from "@components/molecule/product-card";
import Layout from "@components/template/layout";
import { Product, Record } from "@prisma/client";
import { NextPage } from "next";
import useSWR from "swr";

interface ProductWithUser extends Product {
  _count: { records: number };
}

interface RecordWithProduct extends Record {
  product: ProductWithUser;
}

interface PurchaseResponse {
  success: boolean;
  records: RecordWithProduct[];
}

interface RecordProps {
  recordKind: "purchases" | "favs" | "sales";
  title: string;
}

const RecordWrapper: NextPage<RecordProps> = ({ recordKind, title }) => {
  const { data } = useSWR<PurchaseResponse>(
    `/api/users/me/record?kind=${recordKind}`
  );
  return (
    <Layout title={title} canGoBack>
      <section className="flex flex-col divide-y">
        {data?.records.map((record) => (
          <ProductCard
            key={record.product.id}
            id={record.product.id}
            title={record.product.name}
            price={record.product.price}
            heart={record.product._count.records}
            color="black"
            comment={0}
          />
        ))}
      </section>
    </Layout>
  );
};

export default RecordWrapper;
