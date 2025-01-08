import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGeneralDataContext } from "../contexts/generalContext";
import { MonthsDataType } from "../typeInterfaces";
import { useModal } from "../contexts/modalContext";
import NewPersonAndProjectModal from "../components/newPersonAndProjectModal";

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

  const { openModal, closeModal } = useModal();
  const { viewer, isInputInFocus } = useGeneralDataContext();

  useEffect(() => {
    if (!viewer || months.length === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case "m":
          if (isInputInFocus) return;
          router.push(`/people/${encodeURIComponent(viewer.id)}`);
          break;
        case "p":
          if (isInputInFocus) return;
          router.push(`/projects`);
          break;
        case "e":
          if (isInputInFocus) return;
          router.push(`/people`);
          break;
        case "n":
          if (isInputInFocus) return;
          openModal(<NewPersonAndProjectModal closeModal={closeModal} />);
          break;
        case "arrowright":
          if (!isInputInFocus) setDateRange(getNextWeeksPerView(months));

          break;
        case "arrowleft":
          if (!isInputInFocus) setDateRange(getPrevWeeksPerView(months));

          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router, isInputInFocus, months]);
};
