import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { errorToast } from "../../components/toaster";
import { StorageProxy } from "../../data/storage-proxy";
import { IScriptStats } from "../../data/storage-proxy/stats-proxy";
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

export function ScriptsChart(): JSX.Element {
    const chainId = useSelector((state: RootState) => state.wallet.chainId)!;
    const [data, setData] = useState<IScriptStats[]>([]);

    const fetchData = async () => {
        try {
            const data = await StorageProxy.stats.getScriptStats(chainId);
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
                <Bar data={scriptStatsToBarChartData(data)} height={150} options={options}></Bar>
            )}
        </div>
    );
}
