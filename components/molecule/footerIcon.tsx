import { NextPage } from "next";

interface FooterIconProps {
  d: string;
  name: string;
}

const FooterIcon: NextPage<FooterIconProps> = ({ d, name }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      </svg>
      <p className="text-xs">{name}</p>
    </div>
  );
};

export default FooterIcon;
