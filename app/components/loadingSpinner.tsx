import React, {CSSProperties} from "react";
import SyncLoader from "react-spinners/SyncLoader";

export const LoadingSpinner = () => {
    const override: CSSProperties = {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
	return (
		<SyncLoader
			color={"#72DDC3"}
			loading
            cssOverride={override}
			size={15}
			aria-label="Loading Spinner"
			data-testid="loader"
		/>
	);
};
