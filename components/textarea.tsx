import { NextPage } from "next";

interface TextareaProps {
  name: string;
  placeholder?: string;
}

const Textarea: NextPage<TextareaProps> = ({ name, placeholder }) => {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm text-gray-700">{name}</h3>
      <div className="flex items-center">
        <textarea
          rows={4}
          placeholder={placeholder}
          className="resize-none appearance-none w-full border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-400 focus:border-orange-400"
        />
      </div>
    </div>
  );
};

export default Textarea;
