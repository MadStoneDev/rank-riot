"use client";

import { ReactNode } from "react";
import { SubscriptionProvider } from "./SubscriptionProvider";

interface SubscriptionProviderWrapperProps {
  children: ReactNode;
  userId: string;
  userEmail: string;
}

export default function SubscriptionProviderWrapper({
  children,
  userId,
  userEmail,
}: SubscriptionProviderWrapperProps) {
  return (
    <SubscriptionProvider userId={userId} userEmail={userEmail}>
      {children}
    </SubscriptionProvider>
  );
}
