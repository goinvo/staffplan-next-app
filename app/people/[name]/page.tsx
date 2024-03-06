'use client'
import { useParams  } from 'next/navigation';
import React, { useEffect } from 'react';
import withApollo from '@/lib/withApollo';

const UserPage: React.FC = () => {
    const params = useParams ();

    console.log(params);
    if (params.name) { 
        console.log(decodeURIComponent(params.name.toString()));
    }

    return (
        <div>
            <h1>Assignments for {decodeURIComponent(params.name.toString())}</h1>
            {/* Display user-specific content here */}
        </div>
    );
};

export default withApollo(UserPage);
