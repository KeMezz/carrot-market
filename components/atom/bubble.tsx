import { cls } from "@libs/client/utils";
import { NextPage } from "next";
import Image from "next/image";

interface BubbleProps {
  message: string;
  avatar?: string;
  reversed?: boolean;
}

const ProfileAvatar = ({ avatar }: { avatar?: string }) => {
  if (avatar)
    return (
      <Image
        width={40}
        height={40}
        className="w-10 h-10 rounded-full bg-slate-400"
        src={`https://imagedelivery.net/bNh-NL16qgpnc_aca1vxPw/${avatar}/avatar`}
        alt="avatar"
      />
    );
  return <div className="w-10 h-10 rounded-full bg-slate-400" />;
};

const Bubble: NextPage<BubbleProps> = ({ message, reversed, avatar }) => {
  return (
    <div
      className={cls(
        "flex gap-4",
        !reversed ? "self-start justify-start" : "self-end justify-end"
      )}
    >
      {!reversed ? <ProfileAvatar avatar={avatar} /> : null}
      <div className="p-2 border rounded-lg max-w-[80%]">
        <p>{message}</p>
      </div>
      {reversed ? <ProfileAvatar avatar={avatar} /> : null}
    </div>
  );
};

export default Bubble;
