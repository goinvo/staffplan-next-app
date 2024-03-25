import {
	ApolloClient,
	ApolloLink,
	from,
	ApolloLink,
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

	// automatically save the CSRF token from responses to localStorage
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

	// automatically add the CSRF token to headers
	const csrfMiddleware = new ApolloLink((operation, forward) => {

		const csrfTokenValue = localStorage.getItem("csrf-token");

		if (csrfTokenValue) {
			operation.setContext(({ headers = {} }) => ({
				headers: {
					"X-Csrf-Token": csrfTokenValue,
				},

			}));
		}

		return forward(operation);

	});
	const errorLink = onError(({ networkError, graphQLErrors }) => {
		if ((networkError as ServerError).statusCode === 403) {
			return window.location.replace(signinURL);
		}
	});
	return new ApolloClient({
		link: from([
			csrfMiddleware,
			errorLink,
			saveCsrfTokenMiddleware.concat(httpLink),
		]),

		defaultOptions: {
			query: {
				errorPolicy: "all",
				fetchPolicy: "no-cache",
			},
			mutate: {
				errorPolicy: "all",
				awaitRefetchQueries: true,
			},
			watchQuery: {},
		},
		cache: new InMemoryCache({
			typePolicies: {
				Query: {
					fields: {
						assignment: {
							read(_, { args, toReference }) {
								return toReference({
									__typename: "assignment",
									id: args?.id,
								});
							},
						},
					},
				},
			},
			addTypename: true,
		}),
		connectToDevTools: true,
	});
}
export default createApolloClient;
