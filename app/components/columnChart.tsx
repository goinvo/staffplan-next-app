import React from 'react';

type ChartProps = {
    height: number;
    isBeforeWeek: boolean;
    proposedHours?: number;
    maxValue?: number;
    textColor?: string;
    className?: string;
    hasActualHoursForWeek?: boolean;

}

const ColumnChart = ({
    height,
    isBeforeWeek,
    proposedHours = 0,
    maxValue = 50,
    textColor = 'white',
    hasActualHoursForWeek,

}: ChartProps) => {
    const validatedHeight = Math.max(0, Math.min(height, maxValue));
    const validatedProposedHeight = Math.max(0, Math.min(proposedHours, maxValue));
    const scale = 100 / (maxValue + 30);
    const svgHeight = validatedHeight * scale;
    const proposedSvgHeight = validatedProposedHeight * scale
    const mainPathColor = hasActualHoursForWeek || isBeforeWeek ? '#AEB3C0' : '#27B5B0';
    const proposedFillColor = isBeforeWeek ? '#AEB3C0' : '#79e3e0';
    const shouldRenderEstimatedWithProposedPath = !hasActualHoursForWeek && proposedSvgHeight > 0;
    const shouldRenderOnlyProposedPath = !hasActualHoursForWeek && proposedHours >= height;

    const drawPath = () => (
        <>
            <path
                d={`M0 3C0 1.34315 1.34315 0 3 0H31C32.6569 0 34 1.34315 34 3V${svgHeight}H0V3Z`}
                fill={mainPathColor}
            />
            {shouldRenderOnlyProposedPath && (
                <path
                    d={`M0 3C0 1.34315 1.34315 0 3 0H31C32.6569 0 34 1.34315 34 3V${svgHeight}H0V3Z`}
                    fill={proposedFillColor}
                />
            )}
            {shouldRenderEstimatedWithProposedPath && !shouldRenderOnlyProposedPath && (
                <path
                    d={`M0 ${svgHeight}L0 ${svgHeight - proposedSvgHeight}L34 ${svgHeight - proposedSvgHeight}L34 ${svgHeight}H0V3Z`}
                    fill={proposedFillColor}
                />
            )}
        </>
    );
    return (
        <div className='w-[34px]'>
            <div className="absolute bottom-0 left-0 right-0 max-w-[34px] px-1">
                <span className={`flex justify-center text-center w-[34px] text-${textColor}`}>
                    {height || 0}
                </span>
                {!!height && (
                    <svg width='34px' height={svgHeight} viewBox={`0 0 34 ${svgHeight}`} xmlns="http://www.w3.org/2000/svg" className="transition-height duration-200 ease"
                    >
                        {drawPath()}
                    </svg>
                )}
            </div>
        </div>
    );
};

export default ColumnChart;
