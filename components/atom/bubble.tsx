import { cls } from "@libs/client/utils";
import { NextPage } from "next";

interface BubbleProps {
  message: string;
  reversed?: boolean;
}

const ProfileAvatar = () => {
  return <div className="w-10 h-10 rounded-full bg-slate-400" />;
};

const Bubble: NextPage<BubbleProps> = ({ message, reversed }) => {
  return (
    <div
      className={cls(
        "flex gap-4",
        !reversed ? "self-start justify-start" : "self-end justify-end"
      )}
    >
      {!reversed ? <ProfileAvatar /> : null}
      <div className="p-2 border rounded-lg max-w-[80%]">
        <p>{message}</p>
      </div>
      {reversed ? <ProfileAvatar /> : null}
    </div>
  );
};

export default Bubble;
