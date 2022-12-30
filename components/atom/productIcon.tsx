import { NextPage } from "next";

interface ProductIconProps {
  d: string;
  count: number;
}

const ProductIcon: NextPage<ProductIconProps> = ({ d, count }) => {
  return (
    <div className="flex gap-1 items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      </svg>
      <p className="text-xs">{count}</p>
    </div>
  );
};

export default ProductIcon;
