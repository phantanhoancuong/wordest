"use client";

import { useEffect } from "react";

import { authClient } from "@/lib/auth/auth-client";

/**
 * Authentication provider component that ensures users have a valid reason.
 *
 * On mount, check for an existing session. If no session is found, automatically creates an anonymous session.
 * This guarantees all child components have access to an authenticated context.
 *
 * Monitor session state and recreate anonymous session when the users sign out.
 */
function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    const initAuth = async () => {
      if (isPending) return;
      if (!session) await authClient.signIn.anonymous();
    };

    initAuth();
  }, [session, isPending]);

  return <>{children}</>;
}

export default AuthProvider;
