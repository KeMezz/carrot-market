import { NextPage } from "next";

interface InputLabelProps {
  id: string;
  name: string;
}

const InputLabel: NextPage<InputLabelProps> = ({ id, name }) => {
  return (
    <label htmlFor={id} className="text-sm text-gray-700">
      {name}
    </label>
  );
};

export default InputLabel;
