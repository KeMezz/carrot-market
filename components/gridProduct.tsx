import { NextPage } from "next";

interface GridProductProps {
  title: string;
  price: number;
}

const GridProduct: NextPage<GridProductProps> = ({ title, price }) => {
  return (
    <div>
      <div className="w-full h-56 bg-slate-300 mb-3" />
      <h4 className="font-semibold">{title}</h4>
      <p>${price}</p>
    </div>
  );
};

export default GridProduct;
