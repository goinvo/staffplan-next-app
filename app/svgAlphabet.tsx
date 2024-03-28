import React from "react";
import { SVGAlphabetProps } from "./typeInterfaces";
export const SVGAlphabet = ({ name }: SVGAlphabetProps) => {
	const firstLetter = name.split("")[0].toUpperCase();
	return (
		<svg className="w-full">
			<rect x="0" y="0" width="100%" height="100%" fill={"#72DDC3"} />
			<text x="20" y="50" fontFamily="Helvetica" fontSize="44" fill={"#435064"}>
				{firstLetter}
			</text>
		</svg>
	);
};
