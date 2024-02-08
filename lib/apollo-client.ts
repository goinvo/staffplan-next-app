import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';

const uri = process.env.NODE_ENV == 'development' ? 'http://localhost:3000/api/graphql' : 'https://staffplan-ui.fermion.dev/graphql';

function createApolloClient(context = {}) {
  const httpLink = new HttpLink({
    uri: uri,
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
