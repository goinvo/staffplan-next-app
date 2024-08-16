import React from 'react';

type ChartProps = {
    height: number
}

// to do: refactor chart to Charts.js? fix text and chart distance

const ColumnChart = ({ height }: ChartProps) => {

    return (
        <div className="absolute bottom-0 left-0 right-0 w-[100%]">
            <div className='text-sm font-normal text-white pr-2'>{height || 0}</div>
            <div>
                {height && <svg
                    width="90%"
                    height="100%"
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {height}
                    <rect
                        x="0"
                        y={`${100 - height}`}
                        width="100%"
                        height={`${height}%`}
                        fill="#27B5B0"
                    />
                </svg>}
            </div>
        </div>
    );
};

export default ColumnChart;
