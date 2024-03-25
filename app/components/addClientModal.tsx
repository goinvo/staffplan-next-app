"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import withApollo from "@/lib/withApollo";
import { Field, Formik, FormikValues } from "formik";
import { GET_CLIENT_DATA, UPSERT_CLIENT } from "../gqlQueries";
import { ClientType } from "../typeInterfaces";
const AddClient = () => {
	const [clientSide, setClientSide] = useState(false);
	const router = useRouter();
	useEffect(() => {
		setClientSide(true);
	}, []);
	const searchParams = useSearchParams();
	const showModal = searchParams.get("addclientmodal");

	const initialValues = {
		name: "",
		status: "",
		description: "",
		clientId: "",
	};

	const { loading, error, data } = useQuery(GET_CLIENT_DATA, {
		context: {
			headers: {
				cookie: clientSide ? document.cookie : null,
			},
		},
		skip: !clientSide,
		errorPolicy: "all",
	});

	const [
		upsertClient,
		{ data: mutationData, loading: mutationLoading, error: mutationError },
	] = useMutation(UPSERT_CLIENT);
	if (mutationLoading) return <p> LOADING PERSON</p>;
	if (mutationError) return <p>ERROR ON PERSON</p>;
	const onSubmitUpsert = ({
		name,
		description,
		status,
		clientId,
	}: FormikValues) => {
		upsertClient({
			variables: {
				name: name,
				description: description,
				status: status,
				clientId: clientId ? clientId : "",
			},
		}).then((res) => {
			router.back();
		});
	};
	const onCancel = () => router.back();
	const validateForm = (values: FormikValues) => {
		const errors: Partial<Record<keyof FormikValues, string>> = {};
		if (!values.status) {
			errors.status = "Status is required";
		}
		if (values.name) {
			const foundClient = data?.clients.find(
				(client: ClientType) => client.name === values.name
			);
			if (foundClient) {
				errors.name = "Client name already in use";
			}
		}
		if (!values.name) {
			errors.name = "Client name required";
		}
		return errors;
	};
	return (
		<>
			{showModal && (
				<div
					className="relative z-50"
					aria-labelledby="person-modal"
					role="dialog"
					aria-modal="true"
				>
					<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

					<div className="fixed inset-0 z-10 w-screen overflow-y-auto">
						<div className="flex min-h-full p-4 text-center justify-center sm:items-center sm:p-0">
							<div className="relative transform overflow-hidden w-1/2 rounded-xl bg-white text-left shadow-xl transition-all">
								<div className="bg-white p-10">
									<div className="sm:flex-auto ">
										<div>
											<Formik
												onSubmit={(e) => onSubmitUpsert(e)}
												initialValues={initialValues}
												validate={validateForm}
											>
												{({
													handleChange,
													values,
													setErrors,
													handleSubmit,
													handleBlur,
													errors,
													touched,
													isValid,
												}) => (
													<form
														className="max-w-lg mx-auto"
														onSubmit={handleSubmit}
													>
														<div className="flex mb-4">
															<label>
																Name(*required)
																<input
																	autoComplete="off"
																	id="clientName"
																	name="name"
																	value={values.name}
																	onBlur={handleBlur}
																	onChange={(e) => {
																		handleChange(e);
																	}}
																	className="block mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
																	placeholder="Enter Client Name"
																/>
															</label>
															<label>
																<Field
																	onChange={handleChange}
																	as="textarea"
																	name="description"
																	id="description"
																	value={values.description}
																	className="block mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
																	placeholder="Description"
																></Field>
															</label>
														</div>

														<div className="flex">
															<div className="border-b border-gray-900/10 pb-12">
																<div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-10">
																	<div className="sm:col-span-1">
																		<div className="mt-2">
																			<div>
																				<label>
																					Status
																					<Field
																						onChange={handleChange}
																						as="select"
																						name="status"
																						id="status"
			onBlur={handleBlur}																	>
																						<option value={""}>SELECT</option>
																						<option value={"active"}>
																							Active
																						</option>
																						<option value={"archived"}>
																							Archived
																						</option>
																					</Field>
																				</label>
																			</div>
																		</div>
																	</div>
																</div>
															</div>
														</div>

														<div className="flex mb-4 justify-between">
															<div className="mr-2"></div>
															<div className="mr-2">
																<button
																	type="button"
																	className="p-2 text-sm font-semibold leading-6 text-gray-900"
																	onClick={() => {
																		onCancel();
																		setErrors({});
																	}}
																>
																	Cancel
																</button>
																<button
																	disabled={!isValid}
																	type="submit"
																	className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
																>
																	Save
																</button>
																{errors.status && touched.status && (
																	<div className="text-red-500">
																		{errors.status}
																	</div>
																)}
																{errors.name && touched.name && (
																	<div className="text-red-500">
																		{errors.name}
																	</div>
																)}
															</div>
														</div>
													</form>
												)}
											</Formik>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};
export default withApollo(AddClient);
