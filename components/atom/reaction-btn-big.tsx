import { NextPage } from "next";

interface ReactionBtnProps {
  title: string;
  d: string;
  count: number;
}

const ReactionBtnBig: NextPage<ReactionBtnProps> = ({ title, d, count }) => {
  return (
    <button className="flex gap-2 items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      </svg>
      <p>{title}</p>
      <p>{count}</p>
    </button>
  );
};

export default ReactionBtnBig;
