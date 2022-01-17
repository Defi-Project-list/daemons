import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { BaseScript } from '../../data/script/base-script';
import { RootState } from '../../state';
import { fetchAllScripts } from '../../state/action-creators/script-action-creators';
import './styles.css';

const QueueScriptComponent = ({ script }: { script: BaseScript; }) => (
    <div className="queue-script">
        <div className="queue-script__id">{script.getId().substring(0, 5)}...</div>
        <div className="queue-script__type">{script.ScriptType}</div>
        <div className="queue-script__actions">
            <button onClick={async () => alert(await script.verify())} className='script__button'>Verify</button>
            <button onClick={async () => alert(await script.execute())} className='script__button'>Execute</button>
        </div>
    </div>
);

interface IQueueComponentsProps {
    fetchAllScripts: () => any;
    fetchedScripts: BaseScript[];
    walletConnected: boolean;
    walletAddress?: string;
    walletChainId?: string;
}

class Queue extends Component<IQueueComponentsProps>{
    componentDidMount() {
        this.props.fetchAllScripts();
    }

    componentDidUpdate(prevProps: IQueueComponentsProps) {
        // TODO when chain changes, load chain scripts (BRG-20)
        if (prevProps.walletConnected !== this.props.walletConnected) {
            this.props.fetchAllScripts();
        }
    }



    public render(): ReactNode {
        // TODO when wallet disconnects, empty the list and show a message (improve on BRG-21)
        if (!this.props.walletConnected) {
            return <div>You must connect :(</div>;
        }

        const scripts = this.props.fetchedScripts.map((script: BaseScript) => <QueueScriptComponent key={script.getId()} script={script}></QueueScriptComponent>);
        console.log(scripts);
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
