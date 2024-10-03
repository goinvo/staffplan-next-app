'use client';
import Navbar from "./components/navbar";
import { Suspense } from "react";
import { UserListProvider } from "./userDataContext";
import { withApollo } from "@/lib/withApollo";
import { ModalProvider } from "./modalContext";
import ModalController from "./components/modalController";

const RootLayoutContents: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative z-0">
      <UserListProvider>
        <ModalProvider>
          <Navbar />
          <Suspense>
            <ModalController />
          </Suspense>
          {children}
        </ModalProvider>
      </UserListProvider>
    </div>
  );
};

export default withApollo(RootLayoutContents);