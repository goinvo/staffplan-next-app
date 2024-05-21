import React from "react";
import { DateTime } from "luxon";
import { TableRow } from "./tableRow";

export const Month = ({ monthData }:any) => {
    const parsedMonth = DateTime.fromFormat(monthData.monthLabel, "M").toFormat("MMM")
    return (
        <div className="w-auto p-1 pr-1 border-r-1">
            <h2>{monthData.monthLabel === "1" ? `${parsedMonth} ${monthData.year}` : parsedMonth }</h2>
            <div className="flex flex-row justify-between">
                {monthData.mondays?.map((monday:number, index:number) => (
                    <div key={`${monthData.monthLabel}-${index}`} className="flex">
                        {monday}
                        <TableRow/>

                    </div>
                ))}
            </div>
        </div>
    );
};

