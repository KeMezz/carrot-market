import { NextPage } from "next";
import { cls } from "@libs/client/utils";
import InputLabel from "./input-label";
import type { UseFormRegisterReturn } from "react-hook-form";

interface TextInputProps {
  name: string;
  id: string;
  placeholder?: string;
  sign?: string;
  unit?: string;
  type: string;
  register: UseFormRegisterReturn;
  maxLength?: number;
}

const TextInput: NextPage<TextInputProps> = ({
  name,
  id,
  placeholder,
  sign,
  unit,
  type,
  register,
  maxLength,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <InputLabel id={id} name={name} />
      <div className="flex items-center relative">
        {sign ? <p className="absolute left-4">{sign}</p> : null}
        <input
          {...register}
          id={id}
          type={type}
          placeholder={placeholder}
          maxLength={maxLength}
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
