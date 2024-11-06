import { useEffect } from "react";

type BeforeUnloadCallback = () => void;

function useBeforeUnload(callback: BeforeUnloadCallback) {
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (typeof callback === "function") {
                callback();
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [callback]);
}

export default useBeforeUnload;
