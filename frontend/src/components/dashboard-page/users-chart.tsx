import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { StorageProxy } from "../../data/storage-proxy";
import { IUserStat } from "../../data/storage-proxy/stats-proxy";
import { RootState } from "../../state";

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

    const prepareData = (): any => {
        const sorted = data.sort((s1, s2) => (s1.date < s2.date ? 1 : -1));
        const labels = sorted.map((d) => d.date);
        const datasets = [
            {
                label: "Users",
                data: sorted.map((d) => d.amount),
                fill: true,
                tension: 0.1
            }
        ];
        return { labels, datasets };
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="dashboard-chart">
            <Line data={prepareData()} height={200} options={options}></Line>
        </div>
    );
}
