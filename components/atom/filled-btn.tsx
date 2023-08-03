import { cls } from "@libs/client/utils";
import { NextPage } from "next";

interface FilledBtnProps {
  title: string;
  disabled?: boolean;
  onClick?: () => void;
  loading?: boolean;
}

const FilledBtn: NextPage<FilledBtnProps> = ({
  title,
  disabled,
  onClick,
  loading,
}) => {
  return (
    <button
      onClick={onClick}
      type="submit"
      className={cls(
        "w-full py-2 text-white rounded-md cursor-pointer",
        disabled
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-orange-400 hover:bg-orange-500"
      )}
      disabled={disabled}
    >
      {loading ? "로딩 중..." : title}
    </button>
  );
};

export default FilledBtn;
