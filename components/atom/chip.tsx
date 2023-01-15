import { NextPage } from "next";

interface ChipProps {
  category: string;
}

const Chip: NextPage<ChipProps> = ({ category }) => {
  return (
    <div className="text-xs px-3 py-1 bg-gray-200 w-fit rounded-xl text-gray-700">
      {category}
    </div>
  );
};

export default Chip;
