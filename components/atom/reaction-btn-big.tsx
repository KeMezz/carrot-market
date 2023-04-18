import { cls } from "@libs/client/utils";
import { NextPage } from "next";

interface ReactionBtnProps {
  title: string;
  d: string;
  count: number;
  isClicked?: boolean;
  onClick?: () => void;
}

const ReactionBtnBig: NextPage<ReactionBtnProps> = ({
  title,
  d,
  count,
  isClicked,
  onClick,
}) => {
  return (
    <button
      className={cls(
        "flex gap-2 items-center",
        isClicked ? "text-green-500" : ""
      )}
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
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
