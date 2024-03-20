import { useCallback, useMemo } from "react";
import { useLazyQuery } from "@apollo/client";
import { GET_USER_ASSIGNMENTS } from "./gqlQueries";

const useFreshData = () => {
	const [getUserAssignments, { called, data, error, loading}] = useLazyQuery(GET_USER_ASSIGNMENTS, {
		fetchPolicy:"no-cache"
	});
	return {
		called,
		data,
		error,
		getUserAssignments,
		loading,
	};
};

export default useFreshData;
