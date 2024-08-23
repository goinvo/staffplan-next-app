import React from 'react';

interface IconButtonProps {
    Icon?: React.ComponentType<{ className?: string }>
    onClick?: () => void
    className?: string
    ariaLabel?: string
    text?: string
    iconSize?: string
    style?: any
    type?: 'button' | 'submit' | 'reset'
}
const IconButton: React.FC<IconButtonProps> = ({ Icon, onClick, iconSize, className, ariaLabel, text, style, type = 'button' }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={className}
            aria-label={ariaLabel}
            style={style}
        >
            <div className='flex self-start py-0.5'>{Icon && <Icon className={iconSize} />}</div>
            {text && <span className='px-1'>
                {text}
            </span>}
        </button>
    );
};

export default IconButton;
