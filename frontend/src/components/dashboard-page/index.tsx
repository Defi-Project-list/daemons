import React from 'react';
import './styles.css';


export function DashboardPage() {
    return (
        <div className='dashboard-page'>
            <div className='title'>Dashboard</div>

            <div className='dashboard-page__layout'>
                <div className='card'><div className='card__title'>Treasury</div>Getting there...</div>
                <div className='card'><div className='card__title'>Scripts</div>Getting there...</div>
                <div className='card'><div className='card__title'>Smiles And Happiness</div>Getting there...</div>
                <div className='card'><div className='card__title'>Users</div>Getting there...</div>
            </div>
        </div>
    );
}
