import React from "react";
import SyncLoader from "react-spinners/SyncLoader";

export const LoadingSpinner = () => {
	return (
		<SyncLoader
			color={"#72DDC3"}
			loading
			size={15}
			aria-label="Loading Spinner"
			data-testid="loader"
		/>
	);
};
