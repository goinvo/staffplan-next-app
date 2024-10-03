'use client'

import { XMarkIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { LoadingSpinner } from "./loadingSpinner";

type AirTableModalProps = {
	closeModal: () => void;
}

const AirTableFormModal = ({ closeModal }: AirTableModalProps) => {
	const [iframeLoaded, setIframeLoaded] = useState(false);

	return (
		<div className="fixed inset-0 z-10 w-screen overflow-y-auto">
			<div className="flex min-h-full p-4 text-center justify-center sm:items-center sm:p-0">
				<div className="relative transform overflow-hidden w-1/2 rounded-xl bg-white text-left shadow-xl transition-all">
					<div className="bg-white px-10 pb-10 my-2">
						<div className="flex justify-end pb-2">
							<button
								className="bg-white rounded-full flex justify-end items-center"
								onClick={closeModal}
							>
								<XMarkIcon className="fill-tiffany w-8 h-8" />
							</button>
						</div>
						<div>
							{!iframeLoaded && <LoadingSpinner />}
							<iframe
								className="airtable-embed w-full h-133 bg-transparent border border-gray-300"
								src={"https://airtable.com/embed/appE6EvqnfyQTmfcG/paggYwwsljwfF9Jdm/form"}
								width="100%"
								height="533"
								style={{ background: "transparent" }}
								onLoad={() => setIframeLoaded(true)}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AirTableFormModal;