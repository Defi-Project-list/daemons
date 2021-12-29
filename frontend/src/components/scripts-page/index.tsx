import React, { Component, ReactNode, useEffect } from 'react';
import { connect } from 'react-redux';
import { IScript } from '../../data/fakescripts';
import { RootState } from '../../state';
import { fetchScripts } from '../../state/action-creators/script-action-creators';
import './styles.css';

const ScriptComponent = ({ script }: { script: IScript; }) => (
    <div className="script">
        <div className="script__description">{script.description}</div>
        <div className="script__actions">
            <button className='script__button'>Edit</button>
            <button className='script__button'>Execute</button>
        </div>
    </div>
);

interface IScriptsComponentsProps {
    fetchScripts: (address: string | null) => any;
    fetchedScripts: IScript[];
    walletAddress: string | null;
}

class Scripts extends Component<IScriptsComponentsProps> {
    componentDidMount() {
        this.props.fetchScripts(this.props.walletAddress);
    }

    componentDidUpdate(prevProps: IScriptsComponentsProps) {
        if (prevProps.walletAddress !== this.props.walletAddress) {
            this.props.fetchScripts(this.props.walletAddress);
        }
    }

    public render(): ReactNode {
        const scripts = this.props.fetchedScripts.map((script: IScript) => <ScriptComponent key={script.id} script={script}></ScriptComponent>);

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
    fetchScripts: fetchScripts,
    fetchedScripts: state.script.fetchedScripts,
    walletAddress: state.wallet,
});

export default connect(mapStateToProps, { fetchScripts })(Scripts);
