"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Banner } from "@/components/client";

import { BackArrowIcon, PersonIcon, SettingsIcon } from "@/assets/icons";

function NavBar() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <Banner
      right={[
        !isHomePage && (
          <Link href="/">
            <BackArrowIcon />
          </Link>
        ),
        <Link href="/stats">
          <PersonIcon />
        </Link>,
        <Link href="/settings">
          <SettingsIcon />
        </Link>,
      ]}
    />
  );
}

export default NavBar;
