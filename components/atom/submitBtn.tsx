import { NextPage } from "next";

interface SubmitBtnProps {
  title: string;
}

const SubmitBtn: NextPage<SubmitBtnProps> = ({ title }) => {
  return (
    <button
      type="submit"
      className="w-full bg-orange-400 py-2 text-white rounded-md cursor-pointer"
    >
      {title}
    </button>
  );
};

export default SubmitBtn;
