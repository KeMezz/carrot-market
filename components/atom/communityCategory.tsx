import { NextPage } from "next";

interface CommunityCategoryProps {
  category: string;
}

const CommunityCategory: NextPage<CommunityCategoryProps> = ({ category }) => {
  return (
    <div className="text-xs px-3 py-1 bg-gray-200 w-fit rounded-xl text-gray-700">
      {category}
    </div>
  );
};

export default CommunityCategory;
