'use client';
import Navbar from "./components/navbar";
import ActionBar from "./components/actionbar";
import AddAssignment from "./components/addAssignmentModal";
import AddProject from "./components/addProjectModal";
import { Suspense } from "react";
import AddClient from "./components/addClientModal";
import { UserListProvider } from "./userDataContext";
import { withApollo } from "@/lib/withApollo";
import AirTableFormModal from "./components/airTableFormModal";

const RootLayoutContents: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative z-0">
      <UserListProvider>
        <Navbar />
        <ActionBar />
        <Suspense>
          <AddAssignment />
          <AddProject />
          <AddClient />
          <AirTableFormModal/>
        </Suspense>
        {children}
      </UserListProvider>
    </div>
  );
};

export default withApollo(RootLayoutContents);