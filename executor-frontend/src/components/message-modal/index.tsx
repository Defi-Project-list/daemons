import React from "react";
import Modal from "react-modal";
import "./styles.css";

const messageModalStyles: any = {
    content: {
        width: "400px",
        borderRadius: "5px",
        transform: "translateX(-50%)",
        top: "25%",
        left: "50%",
        height: "fit-content",
        maxHeight: "80vh",
        padding: "25px",
        boxShadow: " 0 0 12px 0 rgba(0, 0, 0)",
        background: "var(--body-background)",
        border: "none"
    },
    overlay: {
        backgroundColor: "#191919bb"
    }
};

interface IMessageModalProps {
    isOpen: boolean;
    hideDialog: () => void;
    okAction: () => void;
    children: JSX.Element;
}

export function MessageModal({
    isOpen,
    hideDialog,
    okAction,
    children
}: IMessageModalProps): JSX.Element | null {
    const closeAndProceed = () => {
        okAction();
        hideDialog();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={hideDialog}
            style={messageModalStyles}
            ariaHideApp={false}
        >
            <div className="message-dialog">
                <div className="message-dialog__text">{children}</div>
                <div className="message-dialog__buttons-container">
                    <div onClick={closeAndProceed} className="message-dialog__ok-button">
                        Ok
                    </div>
                </div>
            </div>
        </Modal>
    );
}
