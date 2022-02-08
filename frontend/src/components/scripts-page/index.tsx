import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { BaseScript } from '../../data/script/base-script';
import { Token } from '../../data/tokens';
import { RootState } from '../../state';
import { fetchUserScripts } from '../../state/action-creators/script-action-creators';
import { DisconnectedPage } from '../disconnected-page';
import './styles.css';


interface IScriptComponentsProps {
    script: BaseScript;
    fetchScripts: () => Promise<void>;
}

const ScriptComponent = ({ script, fetchScripts }: IScriptComponentsProps) => (
    <div className="script">
        <div className="script__description">{script.getDescription()}</div>
        <div className="script__actions">
            <button onClick={async () => {
                await script.revoke();
                await fetchScripts();
            }} className='script__button'>Revoke</button>
            <button onClick={async () => alert(await script.verify())} className='script__button'>Verify</button>
            <button onClick={async () => alert(await script.execute())} className='script__button'>Execute</button>
        </div>
        <button onClick={() => alert(JSON.stringify(script.getMessage(), null, ' '))} className='script__info-button'>i</button>
    </div>
);

interface IScriptsComponentsProps {
    fetchScripts: (chainId?: string, address?: string) => any;
    fetchedScripts: BaseScript[];
    walletConnected: boolean;
    walletAddress?: string;
    walletChainId?: string;
    tokens: Token[];
}

class Scripts extends Component<IScriptsComponentsProps> {

    public render(): ReactNode {
        if (!this.props.walletConnected) return <DisconnectedPage />;

        const scripts = this.props.fetchedScripts.map((script: BaseScript) => (
            <ScriptComponent
                key={script.getId()}
                script={script}
                fetchScripts={() => this.props.fetchScripts(this.props.walletChainId, this.props.walletAddress)}
            />
        ));
        return (
            <div>
                <div>Your active scripts</div>
                <div className="scripts-container">
                    {scripts.length > 0 ? scripts : <div>Nothing to see here...</div>}

                </div>
            </div>
        );
    }
}

const mapStateToProps: (state: RootState) => IScriptsComponentsProps = state => ({
    fetchScripts: fetchUserScripts,
    fetchedScripts: state.script.userScripts,
    walletConnected: state.wallet.connected,
    walletAddress: state.wallet.address,
    walletChainId: state.wallet.chainId,
    tokens: state.tokens.currentChainTokens,
});

export default connect(mapStateToProps, { fetchScripts: fetchUserScripts })(Scripts);
