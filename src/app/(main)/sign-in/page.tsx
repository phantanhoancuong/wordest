"use client";
import { signIn } from "@/lib/auth/auth-client";

import styles from "@/app/(main)/sign-in/page.module.css";

export default function SignInPage() {
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
