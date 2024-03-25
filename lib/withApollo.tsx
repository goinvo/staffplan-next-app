// withApollo.tsx
import { ApolloProvider } from '@apollo/client';
import createApolloClient from './apollo-client';
import { FC, ReactNode, useContext, useMemo } from 'react';

interface WithApolloProps {
  apolloClient: ReturnType<typeof createApolloClient>;
  apolloState?: any;
  children: ReactNode;
  [key: string]: any;
}

export const withApollo = (Component: FC<WithApolloProps>) => {
  const ApolloComponent: FC<any> = (props) => {
    const ctx = props.ctx;
    const client = useMemo(() => createApolloClient(ctx?.req?.headers.cookie), [ctx]);
    return (
      <ApolloProvider client={client}>
        <Component {...props} apolloClient={client} />
      </ApolloProvider>
    );
  };
  return ApolloComponent;
};

export default withApollo;