"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Banner } from "@/components/client";
import {
  HomeIcon,
  PersonIconFill,
  PersonIconOutline,
  SettingsIcon,
} from "@/assets/icons";
import { useSession } from "@/lib/auth/auth-client";

function NavIcon({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return <span>{children}</span>;
  }

  return <Link href={href}>{children}</Link>;
}

function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isLoggedIn = Boolean(session);
  const accountPath = isLoggedIn ? "/account" : "/sign-in";

  const icons = [
    pathname !== "/" && (
      <NavIcon key="back" href="/">
        <HomeIcon />
      </NavIcon>
    ),

    <NavIcon
      key="account"
      href={accountPath}
      disabled={pathname === accountPath}
    >
      {isLoggedIn ? <PersonIconFill /> : <PersonIconOutline />}
    </NavIcon>,

    <NavIcon
      key="settings"
      href="/settings"
      disabled={pathname === "/settings"}
    >
      <SettingsIcon />
    </NavIcon>,
  ].filter(Boolean);

  return <Banner right={icons} />;
}

export default NavBar;
