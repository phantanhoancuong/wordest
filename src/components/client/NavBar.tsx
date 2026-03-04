"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Banner } from "@/components/client";
import {
  BackArrowIcon,
  PersonIconFill,
  PersonIconOutline,
  SettingsIcon,
} from "@/assets/icons";
import { useSession } from "@/lib/auth/auth-client";

function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isHomePage = pathname === "/";
  const isLoggedIn = Boolean(session);

  const rightIcons = [];

  if (!isHomePage) {
    rightIcons.push(
      <Link href="/">
        <BackArrowIcon />
      </Link>,
    );
  }

  rightIcons.push(
    <Link href={isLoggedIn ? "/account" : "/sign-in"}>
      {isLoggedIn ? <PersonIconFill /> : <PersonIconOutline />}
    </Link>,
  );

  rightIcons.push(
    <Link href="/settings">
      <SettingsIcon />
    </Link>,
  );

  return <Banner right={rightIcons} />;
}

export default NavBar;
