import { NextPage } from "next";

interface CommunityQuestionProps {
  question: string;
}

const CommunityQuestion: NextPage<CommunityQuestionProps> = ({ question }) => {
  return (
    <h2 className="text-lg flex gap-1">
      <span className="text-orange-400">Q.</span>
      {question}{" "}
    </h2>
  );
};

export default CommunityQuestion;
