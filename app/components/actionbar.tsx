// components/ActionBar.tsx
import React from "react";
import AddDropdown from "./addDropdown";
import { FaSortAmountDown, FaExpand, FaFilter, FaSearch } from "react-icons/fa";
import { useUserDataContext } from "../userDataContext";

const ActionBar: React.FC = () => {
	const { scrollToTodayFunction } = useUserDataContext();
	return (
		<div className="actionbar flex justify-between items-center bg-gray-50 p-4">
			<div className="flex items-center space-x-4">
				<AddDropdown />
				<div className="flex items-center border actionbar-border-accent rounded-full">
					<div
						className="w-12 h-8 flex justify-center items-center rounded-l-full actionbar-bg-accent actionbar-text-accent"
						aria-label="sort amount down"
					>
						<FaSortAmountDown />
					</div>
					<div
						className="border-l actionbar-border-accent w-12 h-8 flex justify-center items-center rounded-r-full"
						aria-label="expand"
					>
						<FaExpand />
					</div>
				</div>
				<div className="border-l-2 border-gray-400 h-6"></div>
				<button className="flex justify-center items-center border actionbar-border-accent rounded-full px-4 py-1">
					<div className="w-4 h-4 flex mr-2 " aria-label="filter">
						<FaFilter />
					</div>
					<div className="flex">Filters</div>
				</button>
				<div className="flex justify-center items-center actionbar-text-search">
					<div className="w-4 h-4 flex mr-2" aria-label="search">
						<FaSearch />
					</div>
					<input
						type="text"
						placeholder="Search"
						className="flex bg-transparent py-1 border-none border-gray-300"
					/>
				</div>
			</div>
			<div className="flex items-center space-x-4">
				<span onClick={scrollToTodayFunction}>Today</span>
				<div className="flex items-center border actionbar-border-accent rounded-full">
					<div
						className={
							"px-4 py-1 rounded-l-full actionbar-border-accent " +
							"actionbar-bg-accent actionbar-text-accent"
						}
					>
						Quarter
					</div>
					<div className="px-4 py-1 rounded-r-full border-l actionbar-border-accent">
						Year
					</div>
				</div>
			</div>
		</div>
	);
};

export default ActionBar;
