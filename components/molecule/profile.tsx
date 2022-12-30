import { NextPage } from "next";

const Profile: NextPage = () => {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="w-14 h-14 rounded-full bg-slate-300" />
      <div>
        <p className="font-semibold">Steve Jobs</p>
        <button className="text-sm cursor-pointer">View Profile →</button>
      </div>
    </div>
  );
};

export default Profile;
