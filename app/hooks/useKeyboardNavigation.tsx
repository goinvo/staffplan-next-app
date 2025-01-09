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
  const { viewer } = useGeneralDataContext();

  useEffect(() => {
    if (!viewer || months.length === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInteractiveElement =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isInteractiveElement) {
        return;
      }

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
        case "n":
          openModal(<NewPersonAndProjectModal closeModal={closeModal} />);
          break;
        case "arrowright":
          setDateRange(getNextWeeksPerView(months));

          break;
        case "arrowleft":
          setDateRange(getPrevWeeksPerView(months));

          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router, months]);
};
