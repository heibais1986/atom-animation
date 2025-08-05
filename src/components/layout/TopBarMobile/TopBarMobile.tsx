"use client";

import React, { useRef } from "react";

import styles from "./TopBarMobile.module.css";
import { useAppStore, deriveCurrentElement } from "@/store/appStore";
import { GitHubLink } from "../GithubLink/GithubLink";

export const TopBarMobile = () => {
  const element = useAppStore(deriveCurrentElement);
  const { showHomepageModal, isNavigatingBetweenPages } = useAppStore();

  const topBarRef = useRef<HTMLDivElement>(null);

  const handleElementInfoClick = () => {
    showHomepageModal("cursor");
  };

  return (
    <div ref={topBarRef} className={styles.topBarWrapper}>
      <div className={styles.topBar}>
        <div className={styles.spacer}>
          {/* This spacer balances the hamburger button on the right */}
        </div>
        <div className={styles.elementInfo} onClick={handleElementInfoClick}>
          <span className={styles.elementSymbol}>{element.symbol}</span>
          <span className={styles.elementName}>{element.name}</span>
        </div>

        <GitHubLink />

        {isNavigatingBetweenPages && <div className={styles.loadingBar} />}
      </div>
    </div>
  );
};
