import { ApolloProvider } from '@apollo/client';
import createApolloClient from './apollo-client';
import { FC, ReactNode, useContext, useMemo } from 'react';
import { NextPageContext } from 'next';

interface WithApolloProps {
  apolloClient: ReturnType<typeof createApolloClient>;
  apolloState?: any;
  [key: string]: any;
}

export const withApollo = (Component: FC<WithApolloProps>) => {
  const ApolloComponent: FC<{ ctx?: NextPageContext }> = ({ ctx, ...props }) => {
    const client = useMemo(() => createApolloClient(ctx?.req?.headers.cookie), [ctx]);
    
    return (
      <ApolloProvider client={client}>
        <Component {...props as WithApolloProps} apolloClient={client} />
      </ApolloProvider>
    );
  };

  // Set the correct displayName in development
  if (process.env.NODE_ENV !== 'production') {
    const displayName = Component.displayName || Component.name || 'Component';
    ApolloComponent.displayName = `withApollo(${displayName})`;
  }

  return ApolloComponent;
};

export default withApollo;
