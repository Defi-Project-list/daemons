import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { BaseScript } from '../../data/script/base-script';
import { Token } from '../../data/tokens';
import { RootState } from '../../state';
import { fetchUserScripts } from '../../state/action-creators/script-action-creators';
import { DisconnectedPage } from '../disconnected-page';
import { ScriptComponent } from './script-component';
import './styles.css';


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
