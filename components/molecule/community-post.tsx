import { NextPage } from "next";
import Chip from "../atom/chip";
import ReactionBtnBig from "../atom/reaction-btn-big";
import CommunityQuestion from "./community-question";
import Link from "next/link";

interface CommunityPostProps {
  postId: number;
  user: string;
  question: string;
  createdAt: Date;
  interestCount: number;
  answerCount: number;
}

const CommunityPost: NextPage<CommunityPostProps> = ({
  postId,
  user,
  question,
  createdAt,
  interestCount,
  answerCount,
}) => {
  return (
    <Link href={`/community/${postId}`} className="flex flex-col gap-3 p-4">
      <Chip category="동네질문" />
      <CommunityQuestion question={question} />
      <div className="mt-4 flex justify-between text-xs text-gray-500 pb-4 border-b">
        <p>{user}</p>
        <p>{String(createdAt)}</p>
      </div>
      <div className="flex gap-6 border-b pb-3">
        <ReactionBtnBig
          title="궁금해요"
          count={interestCount}
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <ReactionBtnBig
          title="답변"
          count={answerCount}
          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
        />
      </div>
    </Link>
  );
};

export default CommunityPost;
