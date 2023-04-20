import { NextPage } from "next";
import Link from "next/link";

interface GridProductProps {
  productId: number;
  title: string;
  price: number;
  image?: string;
}

const GridProduct: NextPage<GridProductProps> = ({
  productId,
  title,
  price,
  image,
}) => {
  return (
    <Link href={`/products/${productId}`}>
      <div>
        {image ? (
          <img
            className="w-full h-56 bg-slate-300 mb-3 rounded-lg"
            src={`https://imagedelivery.net/bNh-NL16qgpnc_aca1vxPw/${image}/avatar`}
          />
        ) : (
          <div className="w-full h-56 bg-slate-300 mb-3 rounded-lg" />
        )}
        <h4 className="font-semibold">{title}</h4>
        <p>${price}</p>
      </div>
    </Link>
  );
};

export default GridProduct;
