import React from "react";

interface UndoButtonProps {
    text: string;
    onClick: () => void;
}

const UndoButton: React.FC<UndoButtonProps> = ({ onClick, text }) => {

    return (
        <td
            className="text-contrastBlue opacity-1"
            onClick={onClick}
        >
            <button><span>{text}</span></button>
        </td>
    );
};

export default UndoButton;