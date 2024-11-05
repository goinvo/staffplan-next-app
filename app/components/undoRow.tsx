import React from "react";

interface UndoRowProps {
    text: string;
    onClick: () => void;
}

const UndoRow: React.FC<UndoRowProps> = ({ onClick, text }) => {

    return (
        <td
            className="text-contrastBlue opacity-1"
            onClick={onClick}
        >
            <button><span>{text}</span></button>
        </td>
    );
};

export default UndoRow;