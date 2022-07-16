export interface ITransaction {
    hash: string;
    chainId: string;
    scriptId: string;
    scriptType: string;
    description: string;
    executingUser: string;
    beneficiaryUser: string;
    date: Date|string;
    costEth: number;
    costDAEM: number;
    profitDAEM: number;
}
