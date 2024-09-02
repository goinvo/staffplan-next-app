import { usePathname } from 'next/navigation';
import EditUserForm from '../userAssignment/editUserForm';
import EditProjectForm from '../allProjects/editProjectForm';

interface EditFormControllerProps {
    onClose: () => void
}

const EditFormController = ({ onClose }: EditFormControllerProps) => {
    const pathname = usePathname()

    const renderComponent = () => {
        if (pathname.includes('people')) {
            return <EditUserForm onClose={onClose} />;
        }
        if (pathname.includes('projects')) {
            return <EditProjectForm onClose={onClose} />;
        }
    };

    return (
        renderComponent()
    );
};

export default EditFormController;
