import { NextPage } from "next";
import InputLabel from "./input-label";

interface TextareaProps {
  name?: string;
  id: string;
  placeholder?: string;
}

const Textarea: NextPage<TextareaProps> = ({ name, id, placeholder }) => {
  return (
    <div className="flex flex-col gap-2">
      {name ? <InputLabel id={id} name={name} /> : null}
      <div className="flex items-center">
        <textarea
          id={id}
          rows={4}
          placeholder={placeholder}
          className="resize-none appearance-none w-full border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-400 focus:border-orange-400"
        />
      </div>
    </div>
  );
};

export default Textarea;
