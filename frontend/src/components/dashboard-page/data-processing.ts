import { IScriptStats, IUserStat } from "../../data/storage-proxy/stats-proxy";

const colors: { [k: string]: string } = {
    // Swap: "#184E77",
    // Transfer: "#1E6091",
    // MmBase: "#1A759F",
    // MmAdvanced: "#168AAD",
    // alt1: "#34A0A4",
    // alt2: "#52B69A",
    // alt3: "#76C893",
    // alt4: "#99D98C",
    // alt5: "#B5E48C",
    // alt6: "#D9ED92",

    Beefy: "#76C893",
    MmAdvanced: "#52B69A",
    MmBase: "#34A0A4",
    Swap: "#168AAD",
    Transfer: "#1A759F",
    ZapIn: "#1E6091",
    ZapOut: "#184E77",
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
    const allKinds = new Set<string>(
        scriptStats
            .map((d) => d.kind)
            .sort()
            .reverse()
    );
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
