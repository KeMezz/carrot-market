import { NextPage } from "next";

interface ProfileBtnProps {
  title: string;
  d: string;
}

const ProfileBtn: NextPage<ProfileBtnProps> = ({ title, d }) => {
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <div className="w-16 h-16 bg-orange-400 rounded-full flex justify-center items-center text-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
      </div>
      <p>{title}</p>
    </div>
  );
};

export default ProfileBtn;
