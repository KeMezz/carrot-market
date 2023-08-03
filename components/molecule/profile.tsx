import { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";

interface ProfileProps {
  userId?: number;
  name?: string;
  avatar?: string | null;
  editable?: boolean;
}

const Profile: NextPage<ProfileProps> = ({
  userId,
  name,
  avatar,
  editable,
}) => {
  return (
    <section className="flex items-center gap-6 py-4">
      {avatar ? (
        <Image
          width={80}
          height={80}
          priority
          className="rounded-full bg-slate-300"
          src={`https://imagedelivery.net/bNh-NL16qgpnc_aca1vxPw/${avatar}/avatar`}
          alt="avatar"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-slate-300" />
      )}
      <div className="flex flex-col items-start">
        <p className="text-lg font-semibold">{name}</p>
        {editable ? (
          <Link href="/profile/edit">
            <button className="text-xs hover:underline">
              프로필 수정하기 →
            </button>
          </Link>
        ) : (
          <Link href={`/users/${userId}`}>
            <button className="text-xs hover:underline">프로필 보기 →</button>
          </Link>
        )}
      </div>
    </section>
  );
};

export default Profile;
