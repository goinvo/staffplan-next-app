"use client";
import React from "react";

import { useGeneralDataContext } from "../contexts/generalContext";
import { useUserDataContext } from "../contexts/userDataContext";

const InlineButtonInactiveUser: React.FC = () => {

  const { showInactiveUsers, setShowInactiveUsers, setIsFirstShowInactiveUsers, setIsFirstHideInactiveUsers } = useGeneralDataContext();
  const { userList } = useUserDataContext()

  const inactiveUsers = userList.filter((user) => !user.isActive);

  const label = showInactiveUsers
    ? `Hide ${inactiveUsers.length} deactivated people`
    : `Show ${inactiveUsers.length} deactivated people`;

  return (
    <>
      {inactiveUsers.length > 0 ? (
        <div className="h-[100px] w-full">
          <button
            className="ml-5 mt-2 py-1"
            onClick={() => {
              if (showInactiveUsers) {
                setIsFirstHideInactiveUsers(true)
                setTimeout(() => {setShowInactiveUsers(false)}, 600)
              }

              if (!showInactiveUsers) {
                setIsFirstShowInactiveUsers(true);
                setShowInactiveUsers(true);
              }
            }}
          >
            {label}
          </button>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default InlineButtonInactiveUser;