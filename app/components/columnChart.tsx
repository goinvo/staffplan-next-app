import React from 'react';
import { divideNumberByCommas } from '../helperFunctions';

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
    const shouldNoRenderAnyHours = !hasActualHoursForWeek && isBeforeWeek;

    const renderHeight = () => {
        if (shouldNoRenderAnyHours) {
            return 0;
        }
        return divideNumberByCommas(height) || 0;
    };

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
        <div className='sm:w-[34px] w-[68px]'>
            <div className="absolute bottom-0 left-0 right-0 sm:max-w-[34px] max-w-[68px] px-1">
                <span className={`flex justify-center text-center sm:w-[34px] w-[68px] text-${textColor}`}>
                    {renderHeight()}
                </span>
                {!!height && !shouldNoRenderAnyHours && (
                    <svg
                        height={svgHeight}
                        viewBox={`0 0 34 ${svgHeight}`}
                        xmlns="http://www.w3.org/2000/svg"
                        className="transition-height duration-200 ease sm:w-[34px] w-[68px]"
                    >
                        {drawPath()}
                    </svg>
                )}
            </div>
        </div>
    );
};

export default ColumnChart;
