import React from "react";
import { IPassActionForm } from "../../../../data/chains-data/action-form-interfaces";
import { Form } from "react-final-form";


const validateForm = (values: IPassActionForm) => {
    const errors: any = {};
    return errors;
};

export const PassAction = ({
    form,
    update
}: {
    form: IPassActionForm;
    update: (next: IPassActionForm) => void;
}) => {

    return (
        <Form
            initialValues={form}
            validate={validateForm}
            onSubmit={() => {
                /** Individual forms are not submitted */
            }}
            render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <div className="transfer-block">
                        {/* ENABLE WHEN DEBUGGING!  */}
                        {/* <p>{JSON.stringify(form, null, " ")}</p> */}
                    </div>
                </form>
            )}
        />
    );
};
