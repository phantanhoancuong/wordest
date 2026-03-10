"use client";

import { SettingsSection } from "@/components/client";

import styles from "@/app/(main)/privacy/page.module.css";
import { useState } from "react";

export default function PrivacyPage() {
  const [isIntroductionOpen, setIsIntroductionOpen] = useState(true);
  const [isCollectOpen, setIsCollectOpen] = useState(true);
  const [isUseOpen, setIsUseOpen] = useState(true);
  const [isInfrastructureOpen, setIsInfrastructureOpen] = useState(true);
  const [isActionsOpen, setIsActionsOpen] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(true);

  return (
    <div className={styles["privacy-page__scrollbar-wrapper"]}>
      <div className={styles["privacy-page__content"]}>
        <h1>Privacy Policy</h1>
        <p className={styles["policy-section__text"]}>
          Last updated: March 2026
        </p>
        <SettingsSection
          title="introduction"
          isOpen={isIntroductionOpen}
          setIsOpen={setIsIntroductionOpen}
        >
          <p className={styles["policy-section__text"]}>
            This Privacy Policy explains how information is collected, used, and
            protected when you play Wordest. The goal of this policy is to
            clearly describe what data may be processed when you sign in using
            one of the third-party authentication providers providers including
            Facebook, Google, and Apple; play the game; or the interact with the
            application.
          </p>
          <p className={styles["policy-section__text"]}>
            By using this service, you agree to the collection and use of
            information in accordance with this policy.
          </p>
        </SettingsSection>
        <SettingsSection
          title="Information We Collect"
          isOpen={isCollectOpen}
          setIsOpen={setIsCollectOpen}
        >
          <p className={styles["policy-section__text"]}>
            When you sign in to Wordest using a third-party provider, certain
            basic account information may be provided to Wordest by the
            authentication provider. This information may include your name,
            email address, a profile image, and a unique identifier associated
            with your account on that provider's platform.
          </p>
          <p className={styles["policy-section__text"]}>
            Because authentication occurs through these external providers, the
            application does not receive or store your passwords for those
            services. The information provided to the application is limited to
            the basic profile information necessary to create and maintain a
            user account.
          </p>
        </SettingsSection>
        <SettingsSection
          title="How Information Is Used"
          isOpen={isUseOpen}
          setIsOpen={setIsUseOpen}
        >
          <p className={styles["policy-section__text"]}>
            Information collected through the authentication process or through
            use of the application is used solely for operating and improving
            the service. This includes creating and maintaining user aaccounts,
            authenticating returning users, storing game progress, maintaining
            application security, and preventing misuse of the application.
          </p>

          <p className={styles["policy-section__text"]}>
            The information collected is NOT used for advertising purporses and
            is not sold or rented to third parties.
          </p>
        </SettingsSection>
        <SettingsSection
          title="Infrastructure & Data Storage"
          isOpen={isInfrastructureOpen}
          setIsOpen={setIsInfrastructureOpen}
        >
          <p className={styles["policy-section__text"]}>
            The service is hosted using infrastructure provided by Vercel.
            Account and application data are stored in a databased hosted by
            Turso. These infrastructure providers may process limited data as
            necessary to deliver hosting and database services required for the
            operation of the application.
          </p>
          <p className={styles["policy-section__text"]}>
            Reasonable efforts are made to ensure that stored data is protected
            against unauthorized access, disclosure, or alteration.
          </p>
        </SettingsSection>

        <SettingsSection
          title="Data Sharing, Retention & Deletion"
          isOpen={isActionsOpen}
          setIsOpen={setIsActionsOpen}
        >
          <p className={styles["policy-section__text"]}>
            Personal information collected through the application is NOT sold,
            traded, or shared with third parties for commercial purporses. Data
            may only be processed by service providers necessary to operatae the
            application's infrastructure.
          </p>

          <p className={styles["policy-section__text"]}>
            Account information and related gameplay data are retained only for
            as long as necessary to provide the service and maintain the user
            account. If an account is deleted, associated personal data will be
            removed from the system within a reasonable period of time.
          </p>

          <p className={styles["policy-section__text"]}>
            Users may request deletion of their account and associated data by
            contacting the email address listed at the end of this policy. Once
            a deletion request is verified and processed, the account and
            related stored information will permanently removed.
          </p>
        </SettingsSection>

        <SettingsSection
          title="Changes to This Policy & Contact"
          isOpen={isContactOpen}
          setIsOpen={setIsContactOpen}
        >
          <p className={styles["policy-section__text"]}>
            This Privacy Policy may be updated periodically to reflect changes
            in the application or legal requirements.
          </p>

          <p className={styles["policy-section__text"]}>
            If you have questions about this Privacy Policy or would like to
            request deletion of your account data, please contact{" "}
            <b className={styles["privacy-page__email"]}>
              phantanhoancuong@gmail.com
            </b>
          </p>
        </SettingsSection>
      </div>
    </div>
  );
}
