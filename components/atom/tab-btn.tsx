import { NextPage } from "next";
import { cls } from "../../libs/client/utils";

interface LoginMethodBtnProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  isActive: boolean;
  title: string;
}

const LoginMethodBtn: NextPage<LoginMethodBtnProps> = ({
  onClick,
  isActive,
  title,
}) => {
  return (
    <button
      onClick={onClick}
      className={cls(
        "w-1/2 flex justify-center items-center p-4 border-b-2",
        isActive ? "border-orange-400" : "border-gray-200"
      )}
    >
      {title}
    </button>
  );
};

export default LoginMethodBtn;
