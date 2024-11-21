'use client';
import Navbar from "./components/navbar";
import { Suspense } from "react";
import { withApollo } from "@/lib/withApollo";
import ModalController from "./components/modalController";
import AppProviders from "./contexts/appProviders";
import Footer from "./components/footer";

const RootLayoutContents: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative z-0 flex flex-col min-h-screen">
      <AppProviders>
        <ModalController />
        <Navbar />
        <Suspense>
          <main className="flex-grow">{children}</main>
        </Suspense>
        <Footer />
      </AppProviders>
    </div >
  );
};

export default withApollo(RootLayoutContents);