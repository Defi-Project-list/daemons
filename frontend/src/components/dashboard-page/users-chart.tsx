import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { StorageProxy } from "../../data/storage-proxy";
import { IUserStat } from "../../data/storage-proxy/stats-proxy";
import { RootState } from "../../state";
import { userStatsToLineChartData } from "./data-processing";

const options = {
    maintainAspectRatio: true,
    responsive: true,
    plugins: {
        legend: {
            display: false,
        }
    },
};

export function UsersChart(): JSX.Element {
    const chainId = useSelector((state: RootState) => state.wallet.chainId)!;
    const [data, setData] = useState<IUserStat[]>([]);

    const fetchData = async () => {
        const data = await StorageProxy.stats.getUserStats(chainId);
        setData(data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="dashboard-chart">
            <Line data={userStatsToLineChartData(data)} height={150} options={options}></Line>
        </div>
    );
}
