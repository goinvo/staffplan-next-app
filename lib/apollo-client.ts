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

	const saveCsrfTokenMiddleware = new ApolloLink((operation, forward) => {
		return forward(operation).map((response) => {
			const context = operation.getContext();
			const { response: { headers } } = context;

			if (headers) {
				const csrfTokenValue = headers.get('x-csrf-token');
				if (csrfTokenValue) {
					localStorage.setItem('csrf-token', csrfTokenValue);
				}
			}

			return response;
		});
	});

	const csrfMiddleware = new ApolloLink((operation, forward) => {
		// add the CSRF token to headers
		operation.setContext(({ headers = {} }) => ({
			headers: {
				"X-Csrf-Token": localStorage.getItem("csrf-token"),
			}
		}));

		return forward(operation);
	})

	const errorLink = onError(({ networkError, graphQLErrors }) => {
		if ((networkError as ServerError).statusCode === 403) {
			return window.location.replace(signinURL);
		}
	});
	return new ApolloClient({
		link: from([csrfMiddleware, errorLink, saveCsrfTokenMiddleware.concat(httpLink)]),
		defaultOptions: {
			query: {
				errorPolicy: "all",
				fetchPolicy:"cache-first"
			},
			mutate: {
				errorPolicy: "all",
			},
		},
		connectToDevTools: true,
		cache: new InMemoryCache({
			addTypename:true
		}),
	});
}

export default createApolloClient;
