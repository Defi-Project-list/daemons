import { IScriptStats, IUserStat } from "../../data/storage-proxy/stats-proxy";

const colors: { [k: string]: string } = {
    Swap: "#90be6d",
    Transfer: "#43aa8b",
    MmBase: "#4d908e"
};

export const userStatsToLineChartData = (userStats: IUserStat[]): any => {
    const sorted = userStats.sort((s1, s2) => (s1.date > s2.date ? 1 : -1));
    const labels = sorted.map((d) => d.date);
    const datasets = [
        {
            label: "Users",
            data: sorted.map((d) => d.amount),
            fill: true,
            tension: 0.3,
            backgroundColor: "#277da1aa"
        }
    ];
    return { labels, datasets };
};

export const scriptStatsToBarChartData = (scriptStats: IScriptStats[]): any => {
    const sortedDates = Array.from(new Set<string>(scriptStats.map((d) => d.date))).sort();
    const allKinds = new Set<string>(scriptStats.map((d) => d.kind));
    const grouped: { [date: string]: { [kind: string]: number } } = {};

    scriptStats.forEach((d) => {
        if (!grouped[d.date]) {
            grouped[d.date] = {};
            allKinds.forEach((k) => (grouped[d.date][k] = 0));
        }
        grouped[d.date][d.kind] = d.amount;
    });

    const sortedAndGrouped: { [kind: string]: number[] } = {};
    allKinds.forEach((kind) => (sortedAndGrouped[kind] = []));
    allKinds.forEach((kind) =>
        sortedDates.forEach((date) => sortedAndGrouped[kind].push(grouped[date][kind]))
    );

    const labels = sortedDates;
    const datasets = Object.keys(sortedAndGrouped).map((kind) => ({
        label: kind,
        data: sortedAndGrouped[kind],
        backgroundColor: colors[kind]
    }));

    return { labels, datasets };
};
