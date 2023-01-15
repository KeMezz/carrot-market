import { NextPage } from "next";
import { cls } from "../../libs/utils";
import InputLabel from "./input-label";

interface TextInputProps {
  name: string;
  id: string;
  placeholder?: string;
  sign?: string;
  unit?: string;
}

const TextInput: NextPage<TextInputProps> = ({
  name,
  id,
  placeholder,
  sign,
  unit,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <InputLabel id={id} name={name} />
      <div className="flex items-center relative">
        {sign ? <p className="absolute left-4">{sign}</p> : null}
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          className={cls(
            "appearance-none w-full border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-400 focus:border-orange-400",
            sign !== undefined ? "pl-8" : ""
          )}
        />
        {unit ? <p className="absolute right-4">{unit}</p> : null}
      </div>
    </div>
  );
};

export default TextInput;
