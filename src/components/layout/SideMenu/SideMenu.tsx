// src/components/layout/SideMenu/SideMenu.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SideMenu.module.css";

export const SideMenu = () => {
  const pathname = usePathname();

  const isPeriodicTable = pathname === "/periodic-table";
  const href = isPeriodicTable ? "/" : "/periodic-table";
  const buttonText = isPeriodicTable ? "Show 3D Model" : "Show Periodic Table";

  return (
    <div className={styles.sideMenuContainer}>
      <Link href={href} className={styles.toggleButton}>
        {buttonText}
      </Link>
    </div>
  );
};
