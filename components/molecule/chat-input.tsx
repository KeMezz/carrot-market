import { NextPage } from "next";
import { UseFormRegisterReturn } from "react-hook-form";

interface ChatInputProps {
  register: UseFormRegisterReturn;
}

const ChatInput: NextPage<ChatInputProps> = ({ register }) => {
  return (
    <div className="fixed bottom-0 p-4 w-full flex items-center max-w-[608px]">
      <input
        {...register}
        type="text"
        className="w-full rounded-full border-gray-400 focus:outline-none focus:ring-orange-400 focus:border-orange-400"
      />
      <button className="absolute right-6 px-3 py-2 bg-orange-400 text-white rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
          />
        </svg>
      </button>
    </div>
  );
};

export default ChatInput;
