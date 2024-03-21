import React from "react";
interface SVGAlphabetProps {
	name: string;
}
export const SVGAlphabet = ({ name }: SVGAlphabetProps) => {
    const firstLetter = name.split("")[0].toUpperCase()
	const colors = ["blue", "red", "green", "orange", "purple","cyan"];

	const getRandomColor = () => {
		const randomIndex = Math.floor(Math.random() * colors.length);
		return colors[randomIndex];
	};

	const randomColor = getRandomColor();
	return (
		<svg className="w-full">
            <rect x="0" y="0" width="100%" height="100%" fill={randomColor} />
			<text x="20" y="50" fontFamily="Helvetica" fontSize="44" fill={"grey"}>
				{firstLetter}
			</text>
		</svg>
	);
};
