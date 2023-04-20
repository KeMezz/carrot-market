import { NextPage } from "next";
import Link from "next/link";

interface ProfileProps {
  userId: number;
  name: string;
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
      <div className="w-20 h-20 rounded-full bg-slate-300" />
      <div className="flex flex-col items-start">
        <p className="text-lg font-semibold">{name}</p>
        {editable ? (
          <Link href="/profile/edit">
            <button className="text-xs hover:underline">Edit Profile →</button>
          </Link>
        ) : (
          <Link href={`/users/profiles/${userId}`}>
            <button className="text-xs hover:underline">View Profile →</button>
          </Link>
        )}
      </div>
    </section>
  );
};

export default Profile;
