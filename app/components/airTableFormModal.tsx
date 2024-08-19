"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import withApollo from "@/lib/withApollo";
import { Field, Formik, FormikValues } from "formik";
import { UPSERT_CLIENT } from "../gqlQueries";
import { ClientType } from "../typeInterfaces";
import { LoadingSpinner } from "./loadingSpinner";
import { Dialog } from "@headlessui/react";
import { useUserDataContext } from "../userDataContext";
import { MinusIcon, XMarkIcon } from "@heroicons/react/24/solid";
const AirTableFormModal = () => {
	const [clientSide, setClientSide] = useState(false);
	const router = useRouter();
	useEffect(() => {
		setClientSide(true);
	}, []);
	const searchParams = useSearchParams();
	const modalParam = searchParams.get("airTableFormModal");
	const showModal = modalParam ? true : false;
	const onCancel = () => router.back();
	return (
		<>
			{showModal && (
				<Dialog
					open={showModal}
					onClose={onCancel}
					className="relative z-50"
					aria-labelledby="client-modal"
					aria-modal="true"
				>
					<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

					<div className="fixed inset-0 z-10 w-screen overflow-y-auto">
						<div className="flex min-h-full p-4 text-center justify-center sm:items-center sm:p-0">
							<div className="relative transform overflow-hidden w-1/2 rounded-xl bg-white text-left shadow-xl transition-all">
								<div className="bg-white p-10">
									<div className="sm:flex-auto ">
										<button
											className="bg-white border-2 border-accentgreen w-8 h-8 ml-2 rounded-full flex justify-center items-center"
											onClick={() => onCancel()}
										>
											<XMarkIcon className="fill-accentgreen" />
										</button>
										<div>
											<iframe
												className="airtable-embed w-full h-133 bg-transparent border border-gray-300"
												src="https://airtable.com/embed/appE6EvqnfyQTmfcG/paggYwwsljwfF9Jdm/form"
												frameBorder="0"
												width="100%"
												height="533"
												style={{ background: "transparent" }}
											></iframe>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Dialog>
			)}
		</>
	);
};
export default withApollo(AirTableFormModal);
