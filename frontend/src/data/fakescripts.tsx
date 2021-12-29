export interface IScript {
    id: number;
    address: string;
    description: string;
    condition: string;
    action: string;
}

export const SCRIPTS: IScript[] = [
    {
        id: 1,
        address: '0xC35C79aE067576FcC474E51B18c4eE4Ab36C0274',
        description: 'Claim rewards from YY pool',
        condition: 'Every 12h',
        action: 'Claim XX from YY'
    },
    {
        id: 2,
        address: '0xC35C79aE067576FcC474E51B18c4eE4Ab36C0274',
        description: 'Swap XX for ZZ',
        condition: 'When XX in wallet',
        action: 'Swap XX for ZZ'
    },
    {
        id: 3,
        address: '0xC35C79aE067576FcC474E51B18c4eE4Ab36C0274',
        description: 'Deposit ZZ into the YY pool',
        condition: 'When ZZ in wallet',
        action: 'Deposit ZZ into YY'
    },
];
