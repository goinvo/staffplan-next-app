import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';

function createApolloClient(context = {}) {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URI,
    credentials: 'include', // 'same-origin' if same origin or 'include' if cross-origin
    headers: {
      ...context,
    },
  });

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });
}

export default createApolloClient;
