import { NextPage } from "next";
import Link from "next/link";

interface GridProductProps {
  productId: number;
  title: string;
  price: number;
}

const GridProduct: NextPage<GridProductProps> = ({
  productId,
  title,
  price,
}) => {
  return (
    <Link href={`/products/${productId}`}>
      <div>
        <div className="w-full h-56 bg-slate-300 mb-3 rounded-lg" />
        <h4 className="font-semibold">{title}</h4>
        <p>${price}</p>
      </div>
    </Link>
  );
};

export default GridProduct;
