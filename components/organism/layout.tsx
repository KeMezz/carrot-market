import { ReactNode } from "react";

interface LayoutProps {
  title?: string;
  canGoBack?: boolean;
  children: ReactNode;
}

function Layout({ title, canGoBack, children }: LayoutProps) {
  return (
    <>
      <header className="h-12 border-b">{title}</header>
      {children}
    </>
  );
}

export default Layout;
