import React, { Component, ReactNode } from 'react';
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
    fetchScripts: (address?: string | undefined) => any;
    fetchedScripts: IScript[];
}

class Scripts extends Component<IScriptsComponentsProps> {
    componentDidMount() {
        this.props.fetchScripts();
    }

    public render(): ReactNode {
        return (
            <div>
                <div>Your active scripts</div>
                <div className="scripts-container">
                    {this.props.fetchedScripts.map((script: IScript) => <ScriptComponent key={script.id} script={script}></ScriptComponent>)}

                </div>
            </div>
        );
    }
}

const mapStateToProps: (state: RootState) => IScriptsComponentsProps = state => ({
    fetchScripts: fetchScripts,
    fetchedScripts: state.script.fetchedScripts,
});

export default connect(mapStateToProps, { fetchScripts })(Scripts);
