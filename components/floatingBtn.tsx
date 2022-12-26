import { NextPage } from "next";

interface FloatingBtnProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const FloatingBtn: NextPage<FloatingBtnProps> = ({ onClick }) => {
  return (
    <button
      className="w-16 h-16 rounded-full bg-orange-400 fixed bottom-28 right-4 shadow-lg flex justify-center items-center cursor-pointer"
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8 text-white"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
    </button>
  );
};

export default FloatingBtn;
