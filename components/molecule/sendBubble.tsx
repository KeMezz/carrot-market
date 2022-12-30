import { NextPage } from "next";

interface SendBubbleProps {
  message: string;
}

const SendBubble: NextPage<SendBubbleProps> = ({ message }) => {
  return (
    <div className="flex gap-4 self-end justify-end">
      <div className="p-2 border rounded-lg max-w-[80%]">
        <p>{message}</p>
      </div>
      <div className="w-10 h-10 rounded-full bg-slate-400" />
    </div>
  );
};

export default SendBubble;
