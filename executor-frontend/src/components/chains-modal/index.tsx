import React from "react";
import { GetAvailableChains, ISimplifiedChainInfo } from "../../data/supported-chains";
import Modal from "react-modal";
import "./styles.css";

const availableChainsModalStyles: any = {
    content: {
        width: "400px",
        borderRadius: "5px",
        transform: "translateX(-50%)",
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

interface IChainModalProps {
    selectedChain?: ISimplifiedChainInfo;
    isOpen: boolean;
    hideDialog: () => void;
    setSelectedChain: (chain: ISimplifiedChainInfo) => void;
}

export function ChainsModal({
    selectedChain,
    isOpen,
    hideDialog,
    setSelectedChain,
}: IChainModalProps): JSX.Element | null {
    const chainComponent = (chain: ISimplifiedChainInfo): JSX.Element => {
        return (
            <div
                key={chain.id}
                className={`chains-dialog__chain-entry ${
                    selectedChain?.id === chain.id ? "chains-dialog__chain-entry--selected" : ""
                }`}
                onClick={() => {
                    setSelectedChain(chain);
                    hideDialog();
                }}
            >
                <img className="chains-dialog__chain-image" src={chain.iconPath}></img>
                <div className="chains-dialog__chain-name">{chain.name}</div>
            </div>
        );
    };

    const chains = GetAvailableChains();
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={hideDialog}
            style={availableChainsModalStyles}
            ariaHideApp={false}
        >
            <div className="chains-dialog">
                <div className="chains-dialog__header">
                    <div className="chains-dialog__title">Select a network</div>
                    <div
                        className="chains-dialog__close"
                        onClick={() => {
                            hideDialog();
                        }}
                    ></div>
                </div>
                <div className="chains-dialog__body">{chains.map(chainComponent)}</div>
            </div>
        </Modal>
    );
}
