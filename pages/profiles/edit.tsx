import { NextPage } from "next";

const EditProfile: NextPage = () => {
  return (
    <main className="py-10 px-4">
      <form className="flex flex-col mt-8 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 rounded-full bg-slate-500" />
          <label
            htmlFor="picture"
            className="cursor-pointer py-3 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium focus:ring-2 focus:ring-offset-3 focus:ring-orange-400 text-gray-700"
          >
            Change
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="picture"
            />
          </label>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-400 focus:border-orange-400"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="phone">
            Email Address
          </label>
          <div className="flex rounded-md shadow-sm">
            <span className="flex items-center justify-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 select-none text-sm">
              +82
            </span>
            <input
              type="phone"
              id="phone"
              required
              className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-r-md rounded-l-none shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-400 focus:border-orange-400"
            />
          </div>
        </div>
        <button className="bg-orange-400 hover:bg-orange-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 focus:outline-none mt-5">
          Update Profile
        </button>
      </form>
    </main>
  );
};

export default EditProfile;
