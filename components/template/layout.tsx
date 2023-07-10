import { useRouter } from "next/router";
import { ReactNode } from "react";
import { cls } from "@libs/client/utils";
import FooterIcon from "../molecule/footer-icon";
import Head from "next/head";

interface LayoutProps {
  title?: string;
  canGoBack?: boolean;
  goBackFn?: () => void;
  children: ReactNode;
}

function Layout({ title, canGoBack, children, goBackFn }: LayoutProps) {
  const { back } = useRouter();
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        <header className="h-14 border-b flex justify-between items-center font-semibold text-lg fixed top-0 w-full max-w-xl bg-white px-4 z-10">
          <div>
            {canGoBack ? (
              <button className="flex items-center" onClick={goBackFn ?? back}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
              </button>
            ) : null}
          </div>
          <h1 className="mx-auto">
            {title && title.length > 15 ? title?.slice(0, 15) + "..." : title}
          </h1>
          <div></div>
        </header>
        <section className={cls("pt-14", canGoBack ? "" : "pb-24")}>
          {children}
        </section>
        {canGoBack ? null : (
          <footer className="h-24 border-t flex justify-around items-center bg-white fixed bottom-0 w-full max-w-xl px-2">
            <FooterIcon
              name="홈"
              href="?page=1"
              d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
            <FooterIcon
              name="동네생활"
              href="community"
              d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
            />
            <FooterIcon
              name="채팅"
              href="chat"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
            <FooterIcon
              name="프로필"
              href="profile"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </footer>
        )}
      </main>
    </>
  );
}

export default Layout;
