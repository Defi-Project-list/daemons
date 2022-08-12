import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { errorToast } from "../../components/toaster";
import { StorageProxy } from "../../data/storage-proxy";
import { ITransactionsStats } from "../../data/storage-proxy/stats-proxy";
import { RootState } from "../../state";
import { scriptStatsToBarChartData } from "./data-processing";

const options = {
    maintainAspectRatio: true,
    responsive: true,
    plugins: {
        legend: {
            display: false
        }
    },
    scales: {
        x: {
            stacked: true
        },
        y: {
            stacked: true
        }
    }
};

export function TransactionsChart(): JSX.Element {
    const chainId = useSelector((state: RootState) => state.wallet.chainId)!;
    const [data, setData] = useState<ITransactionsStats[]>([]);

    const fetchData = async () => {
        try {
            const data = await StorageProxy.stats.getTransactionsStats(chainId);
            setData(data);
        } catch (error: any) {
            errorToast(error.toString());
        }
    };

    useEffect(() => {
        fetchData();
    }, [chainId]);

    return (
        <div className="dashboard-chart">
            {data.length > 0 && (
                // Script and tx stats look the same so we can use the same algorithm
                <Bar data={scriptStatsToBarChartData(data)} height={150} options={options}></Bar>
            )}
        </div>
    );
}
