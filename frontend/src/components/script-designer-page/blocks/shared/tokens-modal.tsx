import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { IToken } from "../../../../data/chains-data/interfaces";
import "./tokens-modal.css";

const modalStyles: any = {
    content: {
        width: "400px",
        borderRadius: "5px",
        transform: "translateX(-50%)",
        left: "50%",
        maxHeight: "80vh",
        padding: "24px",
        boxShadow: " 0 0 12px 0 rgba(0, 0, 0)",
        overflow: "hidden",
        background: "var(--body-background)",
        border: "none",
    },
    overlay: {
        backgroundColor: "#191919bb"
    }
};

interface TokensModalProps {
    tokens: IToken[];
    selectedToken?: IToken;
    setSelectedToken: (token: IToken) => void;
}

export const TokensModal = ({ tokens, selectedToken, setSelectedToken }: TokensModalProps) => {
    const [displayedTokens, setDisplayedTokens] = useState<IToken[]>([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    useEffect(() => {
        setDisplayedTokens(tokens);
    }, [tokens]);

    const closeModal = () => {
        setDisplayedTokens(tokens);
        setModalIsOpen(false);
    };

    const filterDisplayedTokens = (value: string) => {
        if (value === "" || !value) {
            setDisplayedTokens(tokens);
            return;
        }
        value = value.toLowerCase();
        const filteredTokens = tokens.filter(
            (t) => t.name?.toLowerCase().includes(value) || t.symbol?.toLowerCase().includes(value)
        );
        setDisplayedTokens(filteredTokens);
    };

    return (
        <>
            <div
                className={`chosen-token ${
                    tokens?.length === 0 ? "script-block__input--error" : ""
                }`}
                onClick={() => {
                    if (tokens?.length > 0) setModalIsOpen(true);
                }}
            >
                {tokens?.length > 0 && selectedToken ? (
                    <>
                        <img
                            className="chosen-token__token-img"
                            src={selectedToken.logoURI}
                            alt={`${selectedToken.symbol} logo`}
                        />
                        <div>{selectedToken.symbol}</div>
                    </>
                ) : (
                    <>
                        <div className="chosen-token__missing-img"></div>
                    </>
                )}
                <i className="chosen-token__arrow-down"></i>
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={modalStyles}
                ariaHideApp={false}
            >
                <div className="tokens-modal">
                    <input
                        className="script-block__input"
                        autoFocus
                        onChange={(e) => {
                            filterDisplayedTokens(e.target.value);
                        }}
                    />

                    <div className="tokens-modal__list">
                        {displayedTokens.map((token, i) => (
                            <div
                                key={i}
                                className="tokens-modal__item"
                                onClick={(e) => {
                                    setSelectedToken(token);
                                    closeModal();
                                }}
                            >
                                <img className="tokens-modal__token-img" src={token.logoURI} />
                                <div>
                                    <div className="tokens-modal__symbol">{token.symbol} - {token.name}</div>
                                    <div className="tokens-modal__address">{token.address}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </>
    );
};
