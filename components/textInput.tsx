import { NextPage } from "next";
import InputLabel from "./inputLabel";

interface TextInputProps {
  name: string;
  id: string;
  placeholder?: string;
  sign?: string;
  unit?: string;
}

/** if option is not undefined, you can add tailwind classes. */
const optionalClasses = (option: string | undefined, style: string): string => {
  if (option !== undefined) {
    return style;
  } else {
    return "";
  }
};

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
      <div className="flex items-center">
        {sign ? <p className="absolute left-8">{sign}</p> : null}
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          className={`appearance-none w-full border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-400 focus:border-orange-400 ${optionalClasses(
            sign,
            "pl-8"
          )}`}
        />
        {unit ? <p className="absolute right-8">{unit}</p> : null}
      </div>
    </div>
  );
};

export default TextInput;
