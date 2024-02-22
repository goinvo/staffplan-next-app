import {
	ApolloClient,
	ApolloLink,
	from,
	HttpLink,
	InMemoryCache,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { ServerError } from "@apollo/client/link/utils";

const uri =
	process.env.NEXT_PUBLIC_GRAPHQL_API_URI || "http://localhost:3000/graphql";
const signinURL = process.env.SIGN_IN_URL || "http://localhost:3000/sign_in";
function createApolloClient(context = {}) {
	const httpLink = new HttpLink({
		uri: uri,
		// 'same-origin' if same origin or 'include' if cross-origin
		credentials: "include",
		headers: {
			...context,
		},
	});

	const errorLink = onError(({ networkError }) => {
		if ((networkError as ServerError).statusCode === 403) {
			return window.location.replace(signinURL);
		}
	});
	return new ApolloClient({
		link: from([errorLink, httpLink]),
		defaultOptions: {
			query: {
				errorPolicy: "all",
			},
			mutate: {
				errorPolicy: "ignore",
			},
		},
		cache: new InMemoryCache(),
	});
}

export default createApolloClient;
