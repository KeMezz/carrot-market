import { NextPage } from "next";

interface ReceivedBubbleProps {
  message: string;
}

const ReceivedBubble: NextPage<ReceivedBubbleProps> = ({ message }) => {
  return (
    <div className="flex gap-4 self-start justify-start">
      <div className="w-10 h-10 rounded-full bg-slate-400" />
      <div className="p-2 border rounded-lg max-w-[80%]">
        <p>{message}</p>
      </div>
    </div>
  );
};

export default ReceivedBubble;
