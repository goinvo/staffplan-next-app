import { usePathname, useSearchParams } from "next/navigation";
import EditUserForm from '../userAssignment/editUserForm';
import EditProjectForm from '../allProjects/editProjectForm';
import EditClientForm from "../editClientForm";

interface EditFormControllerProps {
    onClose: () => void
    clientName?: string
    setCurrentClient?: (name:string) => void
}

const EditFormController = ({ onClose, clientName, setCurrentClient }: EditFormControllerProps) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

  const renderComponent = () => {
    if (searchParams.has("client") && clientName) {
      return (
        <EditClientForm
          onClose={onClose}
          clientName={clientName}
          setCurrentClient={setCurrentClient}
        />
      );
    }
    if (pathname.includes("people")) {
      return <EditUserForm onClose={onClose} />;
    }
    if (pathname.includes("projects") && pathname.split("/").length === 3) {
      return <EditProjectForm onClose={onClose} />;
    }
  };

  return renderComponent();
};

export default EditFormController;
