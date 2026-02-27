"use client";

import Link from "next/link";

import { SessionType } from "@/lib/constants";

import { useActiveSession } from "@/hooks";

import { Banner } from "@/components/client";

import {
  CalendarIcon,
  InfinityIcon,
  PersonIcon,
  SettingsIcon,
} from "@/assets/icons";

function NavBar() {
  const { activeSession, setActiveSession } = useActiveSession();
  if (activeSession === SessionType.DAILY) {
    return (
      <Banner
        right={[
          <InfinityIcon
            key="practice"
            onClick={() => setActiveSession(SessionType.PRACTICE)}
          />,
          <Link key="stats" href="/stats">
            <PersonIcon />
          </Link>,
          <Link key="settings" href="/settings">
            <SettingsIcon />
          </Link>,
        ]}
      />
    );
  } else {
    return (
      <Banner
        right={[
          <CalendarIcon
            key="daily"
            onClick={() => setActiveSession(SessionType.DAILY)}
          />,
          <Link key="stats" href="/stats">
            <PersonIcon />
          </Link>,
          <Link key="settings" href="/settings">
            <SettingsIcon />
          </Link>,
        ]}
      />
    );
  }
}

export default NavBar;
