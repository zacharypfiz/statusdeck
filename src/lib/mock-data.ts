export const generateChartData = (timeRange: string = "24h_card") => {
    const data = [];
    const now = new Date();
    let points = 0;
    let intervalMinutes = 0;

    switch (timeRange) {
        case "1h":
            points = 12;
            intervalMinutes = 5;
            break;
        case "6h":
            points = 72;
            intervalMinutes = 5;
            break;
        case "24h":
            points = 288;
            intervalMinutes = 5;
            break;
        case "7d":
            points = 168;
            intervalMinutes = 60;
            break;
        case "30d":
            points = 120;
            intervalMinutes = 360;
            break;
        case "24h_card":
        default:
            points = 24;
            intervalMinutes = 5;
    }

    for (let i = points - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);
        const hour = time.getHours();

        const baseResponseTime = 150 + Math.sin((hour / 24) * Math.PI * 2) * 50;
        let responseTime = Math.round(baseResponseTime + Math.random() * 80);

        let status = 200;
        const random = Math.random();
        if (random > 0.98) {
            status = 0;
            responseTime = 0;
        } else if (random > 0.95) {
            status = 500 + Math.floor(Math.random() * 4);
        } else if (random > 0.9) {
            status = 400 + Math.floor(Math.random() * 5);
        }

        data.push({
            time: timeRange === "24h_card"
                ? time.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                })
                : time.toISOString(),
            responseTime,
            status,
        });
    }
    return data;
};
