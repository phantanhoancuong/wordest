"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { signIn, useSession } from "@/lib/auth/auth-client";

import styles from "@/app/(main)/sign-in/page.module.css";

export default function SignInPage() {
  const router = useRouter();
  const { data } = useSession();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (data) router.push("./account");
  }, [data, router]);

  if (isLoading)
    return (
      <div className={styles["sign-in-page__content"]}>
        <h1>Authentication process is being called. Please wait a bit.</h1>
      </div>
    );

  return (
    <div className={styles["sign-in-page__content"]}>
      <div>
        <h1>
          Create a free account to save your progress and track your stats.
        </h1>
      </div>
      <div className={styles["sign-in-buttons"]}>
        <button
          className={styles["sign-in-button"]}
          onClick={() => {
            setIsLoading(true);
            signIn.social({
              provider: "google",
              callbackURL: "/account",
              errorCallbackURL: "/",
            });
          }}
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}
