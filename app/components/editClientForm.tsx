"use client";

import React, { useEffect, useState } from "react";
import { FormikValues, useFormik } from "formik";
import { useParams } from "next/navigation";
import { useMutation } from "@apollo/client";

import { UPSERT_CLIENT_WITH_INPUT } from "../gqlQueries";
import { useClientDataContext } from "../contexts/clientContext";
import { ClientType } from "../typeInterfaces";
import { useGeneralDataContext } from "../contexts/generalContext";

interface EditClientFormProps {
  onClose?: () => void;
  clientName: string;
  setCurrentClient?: (name: string) => void;
}

const EditClientForm: React.FC<EditClientFormProps> = ({ onClose, clientName, setCurrentClient }) => {
  const [initialClientName] = useState(clientName);
  const { clientList, setClientList, refetchClientList } = useClientDataContext();
  const { headerTitleWidth } = useGeneralDataContext()

  const params = useParams();

  const [
    upsertClientWithInput,
    { data: mutationData, loading: mutationLoading, error: mutationError },
  ] = useMutation(UPSERT_CLIENT_WITH_INPUT, {
    errorPolicy: "all",
    onCompleted({ upsertClientWithInput }) {
      if (upsertClientWithInput) {
        setCurrentClient?.(upsertClientWithInput.name);
        refetchClientList();
      } 
    },
  });

  useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose?.();
        }
      };
  
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
  }, [onClose]);
  
  const validateForm = (values: FormikValues) => {
    const errors: Partial<Record<keyof FormikValues, string | {}>> = {};
    if (!values.clientName) errors.clientName = "Client is required";

    const isClientExist = clientList.some(
      (client: ClientType) =>
        client.name.toLowerCase() === values.clientName.toLowerCase().trimEnd() &&
        client.name !== initialClientName
    );
    
    if (isClientExist) {
      errors.clientName = "This client name is already taken. Please enter a different name.";
    }

    return errors;
  };

  const formik = useFormik({
    initialValues: {
      clientName: clientName,
    },
    validate: validateForm,
    onSubmit: async (values) => {
      const currentClient = clientList?.find(
        (client) =>
          client.name === initialClientName
      );

      const input = {
        id: currentClient?.id || null,
        name: values.clientName,
      };

      await upsertClientWithInput({
        variables: {
          input,
        },
      });

      onClose?.();
    },
  });

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (formik.dirty) {
        formik.handleSubmit();
      } else {
        onClose?.();
      }
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formik.dirty) {
      formik.handleSubmit();
      onClose?.();
    } else {
      onClose?.();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="flex flex-row w-full space-y-2 my-2 text-white"
    >
      <div className="flex flex-col space-y-2 text-contrastBlue">
        <div className="flex flex-col">
          <input
            type="text"
            name="clientName"
            value={formik.values.clientName}
            onChange={handleClientChange}
            onBlur={formik.handleBlur}
            className="h-10 w-full pl-1 shadow-top-input-shadow text-[28px] leading-[28px] font-bold rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outline-none"
            style={{...(headerTitleWidth ? {width: headerTitleWidth} : {}) }}
            placeholder="Client"
          />
          {formik.touched.clientName && formik.errors.clientName ? (
            <div className="mt-1 ml-1 text-2xs text-left font-normal text-red-500">
              {formik.errors.clientName}
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-between space-x-8 w-full border-t border-gray-600 py-2">
          <div className="flex justify-between w-full space-x-4">
            <button
              className={`w-auto py-2 text-tiny text-center text-white font-normal underline`}
              onClick={() => onClose?.()}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formik.isValid}
              className={`w-auto py-2 px-8 text-tiny text-center bg-tiffany hover:bg-accentgreen rounded-sm text-white`}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default EditClientForm;
