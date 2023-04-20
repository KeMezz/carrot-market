import { cls } from "@libs/client/utils";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";

interface PaginationProps {
  page: number;
  totalCount: number;
}

const Pagination: NextPage<PaginationProps> = ({ page = 1, totalCount }) => {
  const router = useRouter();
  const maxPage = Math.ceil(totalCount / 10);
  const pages = Array.from({ length: 9 }, (_, i) => {
    if (page + 4 > maxPage) {
      return maxPage - 8 + i;
    } else if (page > 5) {
      return i + page - 4;
    } else {
      return i + 1;
    }
  });

  const goFirstPage = () => router.replace({ query: { page: 1 } });
  const goLastPage = () => router.replace({ query: { page: maxPage } });
  const changePage = (number: number) => {
    if (number === page) return;
    router.replace({ query: { page: number } });
  };
  const firstDisabled = Number(router.query.page) === 1;
  const lastDisabled = Number(router.query.page) === maxPage;

  return (
    <div className="flex gap-6 justify-center py-6 mb-16">
      <button
        onClick={goFirstPage}
        disabled={firstDisabled}
        className={cls(
          "hover:bg-gray-100 p-1 rounded-md",
          firstDisabled ? "text-gray-400 hover:cursor-not-allowed" : ""
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-3 h-3"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
          />
        </svg>
      </button>
      {pages.map((number) => (
        <button
          key={number}
          className={cls("", number === page ? "text-orange-400" : "")}
          onClick={() => changePage(number)}
        >
          {number}
        </button>
      ))}
      <button
        onClick={goLastPage}
        disabled={lastDisabled}
        className={cls(
          "hover:bg-gray-100 p-1 rounded-md",
          lastDisabled ? "text-gray-400 hover:cursor-not-allowed" : ""
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-3 h-3"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
