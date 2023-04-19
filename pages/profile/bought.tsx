import { NextPage } from "next";
import ProductList from "@components/organism/product-list";

const Bought: NextPage = () => {
  return <ProductList title="구매내역" recordKind="purchases" />;
};

export default Bought;
