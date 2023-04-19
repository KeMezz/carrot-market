import { NextPage } from "next";
import ProductList from "@components/organism/product-list";

const Loved: NextPage = () => {
  return <ProductList title="관심목록" recordKind="favs" />;
};

export default Loved;
