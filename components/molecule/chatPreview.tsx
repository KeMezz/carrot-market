import { NextPage } from "next";

const ChatPreview: NextPage = () => {
  return (
    <div className="flex p-4 gap-4 items-center">
      <div className="w-12 h-12 rounded-full bg-gray-400" />
      <div>
        <h3 className="font-medium text-gray-700">Steve Jobs</h3>
        <p className="text-gray-600">See you tomorrow in the corner at 2pm!</p>
      </div>
    </div>
  );
};

export default ChatPreview;
