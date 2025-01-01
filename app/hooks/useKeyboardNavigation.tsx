import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGeneralDataContext } from "../contexts/generalContext";
import { MonthsDataType } from "../typeInterfaces";

type KeyboardNavigation = {
  getNextWeeksPerView: (months: MonthsDataType[]) => string;
  getPrevWeeksPerView: (months: MonthsDataType[]) => string;
  setDateRange: (value: string) => void;
  months: MonthsDataType[];
};

export const useKeyboardNavigation = ({
  getNextWeeksPerView,
  getPrevWeeksPerView,
  setDateRange,
  months,
}: KeyboardNavigation) => {
  const router = useRouter();

  const { viewer, isWorkWeekInputInFocus } = useGeneralDataContext();

  useEffect(() => {
    if (!viewer || months.length === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case "m":
          router.push(`/people/${encodeURIComponent(viewer.id)}`);
          break;
        case "p":
          router.push(`/projects`);
          break;
        case "e":
          router.push(`/people`);
          break;
        case "arrowright":
          if (!isWorkWeekInputInFocus) setDateRange(getNextWeeksPerView(months));

          break;
        case "arrowleft":
          if (!isWorkWeekInputInFocus) setDateRange(getPrevWeeksPerView(months));

          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router, isWorkWeekInputInFocus, months]);
};
