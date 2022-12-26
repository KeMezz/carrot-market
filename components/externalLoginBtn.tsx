import { NextPage } from "next";

interface ExteranlLoginBtnProps {
  d: string;
}

const ExternalLoginBtn: NextPage<ExteranlLoginBtnProps> = ({ d }) => {
  return (
    <button className="flex justify-center items-center p-3 border rounded-md text-gray-500 cursor-pointer hover:bg-orange-400 hover:text-white hover:border-orange-400 transition-colors">
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

export default ExternalLoginBtn;
