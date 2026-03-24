"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { authClient } from "@/lib/auth/auth-client";

import { Banner } from "@/components/client";
import {
  HomeIcon,
  PersonIconFill,
  PersonIconOutline,
  SettingsIcon,
} from "@/assets/icons";

/** Props for the {@link NavIcon} component. */
interface NavIconProps {
  /** Target URL for the navigation link. */
  href: string;
  /** If true, renders a span instead of a link (used for current page). */
  disabled?: boolean;
  /** Icon component to render. */
  children: React.ReactNode;
}

/**
 * Navigation icon wrapper that conditionally renders as a link or span.
 *
 * @param props - {@link NavIconProps}.
 * @returns A clickable link or static span containing the icon.
 */
function NavIcon({ href, disabled, children }: NavIconProps) {
  if (disabled) return <span>{children}</span>;

  return <Link href={href}>{children}</Link>;
}

/**
 * Navigation bar component with contextual icons.
 *
 * Display navigation icons in the top banner:
 * - Home icon: Shown when not on the home page.
 * - Account icon: Filled when logged in, outline when anonymous.
 * - Settings icon: Always visible.
 *
 * Icons are disabled (non-clickable) when representing the current page.
 * Use the session state to determine login status and icon styling.
 *
 * @returns The navigation bar UI.
 */
function NavBar() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  /** User is logged in if session exists and user is not anonymous. */
  const isLoggedIn = !isPending && session?.user?.isAnonymous === false;

  const icons = [
    pathname !== "/" && (
      <NavIcon key="back" href="/">
        <HomeIcon />
      </NavIcon>
    ),

    <NavIcon key="account" href="/account" disabled={pathname === "/account"}>
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
