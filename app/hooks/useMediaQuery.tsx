import { useState, useEffect } from 'react';

const useMediaQuery = (query: string) => {

    const [matches, setMatches] = useState<boolean>(false);

    useEffect(() => {
        const checkMediaQuery = () => {
            const mediaQueryList = window.matchMedia(query);
            setMatches(mediaQueryList.matches);
        };


        checkMediaQuery();
        const mediaQueryList = window.matchMedia(query);
        mediaQueryList.addEventListener('change', checkMediaQuery);

        window.addEventListener('resize', checkMediaQuery);

        return () => {
            mediaQueryList.removeEventListener('change', checkMediaQuery);
            window.removeEventListener('resize', checkMediaQuery);
        };
    }, [query]);

    return matches;
};

export default useMediaQuery;