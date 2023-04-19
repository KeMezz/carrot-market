import { NextPage } from "next";
import ProductList from "@components/organism/product-list";

const Sold: NextPage = () => {
  return <ProductList title="판매내역" recordKind="sales" />;
};

export default Sold;
