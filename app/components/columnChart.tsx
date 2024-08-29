import React from 'react';

type ChartProps = {
    height: number
    color?: string
    maxValue?: number
    textColor?: string
    className?: string
}

const ColumnChart = ({ height, color = '#27B5B0', maxValue = 50, textColor = 'white' }: ChartProps) => {
    const validatedHeight = Math.max(0, Math.min(height, maxValue));
    const scale = 100 / (maxValue + 20);
    const svgHeight = validatedHeight * scale;

    return (
        <div className='w-[34px]'>
            <div className="absolute bottom-0 left-0 right-0 w-[100%] pl-1">
                <span className={`flex justify-center text-center w-[34px] text-${textColor}`}>{height || 0}</span>
                {!!height && (
                    <svg width='34px' height={svgHeight} viewBox={`0 0 34 ${svgHeight}`} xmlns="http://www.w3.org/2000/svg">
                        <path
                            d={`M0 3C0 1.34315 1.34315 0 3 0H31C32.6569 0 34 1.34315 34 3V${svgHeight}H0V3Z`}
                            fill={color}
                        />
                    </svg>
                )}
            </div>
        </div>
    );
};

export default ColumnChart;