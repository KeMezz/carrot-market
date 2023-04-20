import { NextPage } from "next";

interface FilledBtnProps {
  title: string;
}

const FilledBtn: NextPage<FilledBtnProps> = ({ title }) => {
  return (
    <button
      type="submit"
      className="w-full bg-orange-400 py-2 text-white rounded-md cursor-pointer hover:bg-orange-500"
    >
      {title}
    </button>
  );
};

export default FilledBtn;
