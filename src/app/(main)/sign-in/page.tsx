"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { signIn, useSession } from "@/lib/auth/auth-client";

import styles from "@/app/(main)/sign-in/page.module.css";

export default function SignInPage() {
  const router = useRouter();

  const { data } = useSession();

  useEffect(() => {
    if (data) router.push("./account");
  }, [data, router]);

  return (
    <div className={styles["sign-in-page__content"]}>
      <button
        onClick={() =>
          signIn.social({
            provider: "google",
            callbackURL: "/account",
            errorCallbackURL: "/",
          })
        }
      >
        Log in through Google
      </button>
    </div>
  );
}
