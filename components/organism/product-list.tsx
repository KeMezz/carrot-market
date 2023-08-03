import ProductCard from "@components/molecule/product-card";
import Layout from "@components/template/layout";
import { Product, Record } from "@prisma/client";
import { NextPage } from "next";
import useSWR from "swr";
import EmptyNoFooter from "./empty-no-footer";

interface ProductWithUser extends Product {
  _count: { records: number; chatRooms: number };
}

interface RecordWithProduct extends Record {
  product: ProductWithUser;
}

interface RecordResponse {
  success: boolean;
  records: RecordWithProduct[];
}

interface RecordProps {
  recordKind: "purchases" | "favs" | "sales";
  title: string;
}

const ProductList: NextPage<RecordProps> = ({ recordKind, title }) => {
  const { data } = useSWR<RecordResponse>(
    `/api/users/me/record?kind=${recordKind}`
  );
  if (!data?.records) return null;
  return (
    <Layout title={title} canGoBack>
      <section className="flex flex-col divide-y">
        {data.records.length === 0 ? (
          <EmptyNoFooter text={`표시할 ${title}이 없어요!`} />
        ) : null}
        {data?.records.map((record) => (
          <ProductCard
            key={record.product.id}
            id={record.product.id}
            title={record.product.name}
            price={record.product.price}
            heart={record.product._count.records}
            image={record.product.image}
            comment={record.product._count.chatRooms}
          />
        ))}
      </section>
    </Layout>
  );
};

export default ProductList;
