'use client';
import Navbar from "./components/navbar";
import { Suspense } from "react";
import { withApollo } from "@/lib/withApollo";
import ModalController from "./components/modalController";
import AppProviders from "./contexts/appProviders";

const RootLayoutContents: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative z-0">
      <AppProviders>
        <ModalController />
        <Navbar />
        <Suspense>
          {children}
        </Suspense>
      </AppProviders>
    </div >
  );
};

export default withApollo(RootLayoutContents);