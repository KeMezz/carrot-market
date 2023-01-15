import { NextPage } from "next";

interface ExteranlLoginBtnProps {
  d: string;
}

const OutlineBtn: NextPage<ExteranlLoginBtnProps> = ({ d }) => {
  return (
    <button className="flex justify-center items-center p-3 border rounded-md text-gray-500 cursor-pointer hover:text-orange-400 hover:border-orange-400 transition-colors">
      <svg
        className="w-5 h-5"
        aria-hidden="true"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d={d} />
      </svg>
    </button>
  );
};

export default OutlineBtn;
