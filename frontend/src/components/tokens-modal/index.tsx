import React, { useEffect, useState } from 'react';
import { IToken } from '../../data/tokens';
import Modal from "react-modal";
import './styles.css';

const modalStyles: any = {
    content: {
        width: "320px",
        borderRadius: "32px",
        transform: "translateX(-50%)",
        left: "50%",
        maxHeight: "80vh",
        padding: "24px",
        boxShadow: " 0 6px 4px 0 rgba(0, 0, 0, 0.19)",
        overflow: "hidden"
    },
};

interface TokensModalProps {
    tokens: IToken[],
    setFormToken: (value: string) => void;
}

export const TokensModal = ({ tokens, setFormToken }: TokensModalProps) => {
    const [selectedToken, setSelectedToken] = useState<IToken>(tokens[0]);
    const [displayedTokens, setDisplayedTokens] = useState<IToken[]>([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    useEffect(() => {
        setDisplayedTokens(tokens)
        const randomIndex = Math.floor(Math.random() * tokens.length);
        setSelectedToken(tokens[randomIndex]);
        setFormToken(tokens[randomIndex].address)
    }, [tokens]);

    useEffect(() => {
        setFormToken(selectedToken.address)
    }, [selectedToken]);

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
        const filteredTokens = tokens.filter(t => t.name?.toLowerCase().includes(value) || t.symbol?.toLowerCase().includes(value));
        setDisplayedTokens(filteredTokens);
    }

    return (
        <>
            {selectedToken &&
                <div className={`token-address ${!tokens[0]?.address ? 'script-block__field--error' : null}`}
                    onClick={(e) => { setModalIsOpen(true) }}>
                    <img className='token-img' src={selectedToken.logoURI} alt={`${selectedToken?.symbol} logo`} />
                    <div>{selectedToken?.symbol}</div>
                    <i className="arrow-down"></i>
                </div>
            }

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={modalStyles}
                ariaHideApp={false}
            >
                <div className='tokens-modal'>
                    <div className='tokens-modal_search'>
                        <input
                            onChange={(e) => { filterDisplayedTokens(e.target.value) }} />
                    </div>
                    <div className='tokens-modal_list'>
                        {
                            displayedTokens.map((token, i) => (
                                <div key={i} className='tokens-modal_item' onClick={(e) => {
                                    setSelectedToken(token);
                                    closeModal()
                                }}>
                                    <img className='token-img' src={token.logoURI} />
                                    <div>
                                        <div>{token.symbol}</div>
                                        <div>{token.name}</div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </Modal></>
    )
}