import { NextPage } from "next";
import Link from "next/link";

interface ProfileProps {
  userId: number;
  name: string;
  avatar?: string | null;
}

const Profile: NextPage<ProfileProps> = ({ userId, name, avatar }) => {
  return (
    <Link
      href={`/users/profiles/${userId}`}
      className="flex items-center gap-4 py-4"
    >
      <div className="w-14 h-14 rounded-full bg-slate-300" />
      <div>
        <p className="font-semibold">{name}</p>
        <button className="text-sm cursor-pointer">View Profile →</button>
      </div>
    </Link>
  );
};

export default Profile;
