import React from "react";

interface CommunityQuestionProps {
  question?: string;
}

const CommunityQuestion = ({ question }: CommunityQuestionProps) => {
  return (
    <h2 className="text-lg flex gap-1">
      <span className="text-orange-400">Q.</span>
      <span className="whitespace-pre-wrap">{question}</span>
    </h2>
  );
};

export default CommunityQuestion;
