"use client";

import { SettingsSection } from "@/components/client";
import styles from "@/app/(main)/terms/page.module.css";
import { useState } from "react";

export default function TermsPage() {
  const [isIntroductionOpen, setIsIntroductionOpen] = useState(true);
  const [isUseOpen, setIsUseOpen] = useState(true);
  const [isAccountsOpen, setIsAccountsOpen] = useState(true);
  const [isContentOpen, setIsContentOpen] = useState(true);
  const [isLiabilityOpen, setIsLiabilityOpen] = useState(true);
  const [isChangesOpen, setIsChangesOpen] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(true);

  return (
    <div className={styles["terms-page__content"]}>
      <h1>Terms of Service</h1>
      <p className={styles["terms-section__text"]}>Last updated: March 2026</p>

      <SettingsSection
        title="Introduction"
        isOpen={isIntroductionOpen}
        setIsOpen={setIsIntroductionOpen}
      >
        <p className={styles["terms-section__text"]}>
          These Terms of Service govern the use of the Wordest application and
          any related services provided through it. By accessing or using the
          application, you agree to comply with and be bound by these terms.
        </p>
        <p className={styles["terms-section__text"]}>
          If you do not agree with these terms, you should not use the
          application.
        </p>
      </SettingsSection>

      <SettingsSection
        title="Use of the Service"
        isOpen={isUseOpen}
        setIsOpen={setIsUseOpen}
      >
        <p className={styles["terms-section__text"]}>
          Wordest is provided as an online word game intended for personal,
          non-commercial use. Users agree to use the application only for lawful
          purposes and in a way that does not disrupt or harm the service.
        </p>
        <p className={styles["terms-section__text"]}>
          Activities such as attempting to interfere with the operation of the
          application, bypass security mechanisms, or manipulate gameplay
          systems through automated tools or exploits are prohibited.
        </p>
      </SettingsSection>

      <SettingsSection
        title="User Accounts"
        isOpen={isAccountsOpen}
        setIsOpen={setIsAccountsOpen}
      >
        <p className={styles["terms-section__text"]}>
          Some features of the application require signing in through a
          third-party authentication provider such as Google, Facebook, or
          Apple. When signing in, users allow the application to create and
          maintain an account using basic profile information provided by those
          services.
        </p>
        <p className={styles["terms-section__text"]}>
          Users are responsible for maintaining the integrity of their accounts
          and should not attempt to impersonate others or create accounts for
          abusive purposes.
        </p>
      </SettingsSection>

      <SettingsSection
        title="Intellectual Property"
        isOpen={isContentOpen}
        setIsOpen={setIsContentOpen}
      >
        <p className={styles["terms-section__text"]}>
          The Wordest application, including its original code, visual design,
          interface elements, and branding, is the intellectual property of the
          creator unless otherwise stated.
        </p>
      </SettingsSection>

      <SettingsSection
        title="Service Availability & Liability"
        isOpen={isLiabilityOpen}
        setIsOpen={setIsLiabilityOpen}
      >
        <p className={styles["terms-section__text"]}>
          The application is provided on an "as is" and "as available" basis.
          While reasonable efforts are made to maintain reliability and
          availability, uninterrupted access to the service cannot be
          guaranteed.
        </p>
        <p className={styles["terms-section__text"]}>
          The creator of the application is not responsible for any losses,
          damages, or interruptions resulting from the use of the service or the
          inability to access it.
        </p>
      </SettingsSection>

      <SettingsSection
        title="Changes to These Terms"
        isOpen={isChangesOpen}
        setIsOpen={setIsChangesOpen}
      >
        <p className={styles["terms-section__text"]}>
          These Terms of Service may be updated periodically to reflect changes
          in the application, its features, or legal requirements.
        </p>
        <p className={styles["terms-section__text"]}>
          Continued use of the service after updates to these terms indicates
          acceptance of the revised Terms of Service.
        </p>
      </SettingsSection>

      <SettingsSection
        title="Contact"
        isOpen={isContactOpen}
        setIsOpen={setIsContactOpen}
      >
        <p className={styles["terms-section__text"]}>
          If you have questions about these Terms of Service, please contact:{" "}
          <b className={styles["terms-page__email"]}>
            phantanhoancuong@gmail.com
          </b>
        </p>
      </SettingsSection>
    </div>
  );
}
