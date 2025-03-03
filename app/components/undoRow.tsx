import React from "react";

interface UndoRowProps {
    onClick: () => void;
    title?: string;
    subtitle?: string
}

const UndoRow: React.FC<UndoRowProps> = ({
  onClick,
  title,
  subtitle,
}) => {
  return (
    <td className="text-contrastBlue w-full h-[100px] p-3">
      <div className="flex flex-col justify-center align-middle w-full h-full bg-[#7DE2DF]">
        {title && <span className="font-bold text-sm text-center">{title}</span>}
        {subtitle && <span className="font-normal text-sm text-center">{subtitle}</span>}
        <button className="w-20 mx-auto font-normal text-sm underline" onClick={onClick}>
          Undo
        </button>
      </div>
    </td>
  );
};

export default UndoRow;