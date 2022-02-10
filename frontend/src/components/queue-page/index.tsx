import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { BaseScript } from '../../data/script/base-script';
import { RootState } from '../../state';
import { fetchAllScripts } from '../../state/action-creators/script-action-creators';
import { DisconnectedPage } from '../disconnected-page';
import { QueueScriptComponent } from './query-script-component';
import './styles.css';


interface IQueueComponentsProps {
    fetchAllScripts: (chainId?: string) => any;
    fetchedScripts: BaseScript[];
    walletConnected: boolean;
    walletAddress?: string;
    walletChainId?: string;
}

class Queue extends Component<IQueueComponentsProps>{
    componentDidMount() {
        this.props.fetchAllScripts(this.props.walletChainId);
    }

    componentDidUpdate(prevProps: IQueueComponentsProps) {
        // TODO when chain changes, load chain scripts (BRG-20)
        if (prevProps.walletConnected !== this.props.walletConnected) {
            this.props.fetchAllScripts(this.props.walletChainId);
        }
    }


    public render(): ReactNode {
        if (!this.props.walletConnected) return <DisconnectedPage />;

        const scripts = this.props.fetchedScripts.map((script: BaseScript) => (
            <QueueScriptComponent key={script.getId()} script={script} />
        ));
        return (
            <div className='queue'>
                <div className='queue__subtitle'>Execute scripts and get rewarded in BRG tokens</div>
                <div className='queue__scripts-container'>
                    {scripts}
                </div>
            </div>
        );
    }

}

const mapStateToProps: (state: RootState) => IQueueComponentsProps = state => ({
    fetchAllScripts: fetchAllScripts,
    fetchedScripts: state.script.allScripts,
    walletConnected: state.wallet.connected,
    walletAddress: state.wallet.address,
    walletChainId: state.wallet.chainId,
});

export default connect(mapStateToProps, { fetchAllScripts: fetchAllScripts })(Queue);
