import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { cls } from "@libs/client/utils";

interface FooterIconProps {
  d: string;
  name: string;
  href: string;
}

const FooterIcon: NextPage<FooterIconProps> = ({ d, name, href }) => {
  const [active, setActive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (router.pathname.split("/")[1] === href.split("?")[0]) {
      setActive(true);
    }
  }, [href, router]);

  return (
    <Link href={`/${href}`}>
      <div
        className={cls(
          `flex flex-col items-center gap-2`,
          active ? "text-orange-400" : ""
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
        <p className="text-xs">{name}</p>
      </div>
    </Link>
  );
};

export default FooterIcon;
