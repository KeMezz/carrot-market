import { NextPage } from "next";

interface FloatingBtnProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  icon?: "add" | "write";
}

const FloatingBtn: NextPage<FloatingBtnProps> = ({ onClick, icon }) => {
  return (
    <button
      className="w-16 h-16 rounded-full bg-orange-400 absolute right-4 bottom-28 shadow-lg flex justify-center items-center cursor-pointer"
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
          d={icon ? icons[icon] : ""}
        />
      </svg>
    </button>
  );
};

const icons = {
  add: "M12 4.5v15m7.5-7.5h-15",
  write:
    "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125",
};

export default FloatingBtn;
