import { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";

interface ChatPreviewProps {
  id: number;
  name: string;
  message: string;
  avatar?: string;
}

const ChatPreview: NextPage<ChatPreviewProps> = ({
  id,
  name,
  message,
  avatar,
}) => {
  return (
    <Link href={`/chat/${id}`}>
      <div className="flex p-4 gap-4 items-center">
        {avatar ? (
          <Image
            alt="avatar"
            src={`https://imagedelivery.net/bNh-NL16qgpnc_aca1vxPw/${avatar}/avatar`}
            className="w-12 h-12 rounded-full bg-gray-400"
            width={48}
            height={48}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-400" />
        )}
        <div>
          <h3 className="font-medium text-gray-700">{name}</h3>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    </Link>
  );
};

export default ChatPreview;
