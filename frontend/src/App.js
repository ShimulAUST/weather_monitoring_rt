import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Chart } from "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";
import "./App.css";

// Register the zoom plugin
Chart.register(zoomPlugin);


const About = () => {
    return (
        <div className="about-container">
            <div className="about-header">
                <h2>About</h2>
            </div>
            <div className="about-content">
                <div className="card">
                    <h3>Group Members</h3>
                    <ul>
                        <li>Shimul Paul - Matriculation No: 1441927</li>
                        <li>Abu Sayeed Bin Mozahid - Matriculation No: 1504365</li>
                        <li>Md Shahab Uddin - Matriculation No: 1505119</li>
                    </ul>
                </div>
                <div className="card">
                    <h3>Summary</h3>
                    <p>
                        The Weather and Pollution Monitoring System is an IoT-based solution utilizing NodeMCU and environmental sensors to collect real-time weather and pollution data.
                    </p>
                    <p>
                        Parameters include temperature, humidity, air quality, and specific pollutants like particulate matter and gases. The system leverages cloud storage for data analysis and visualization on a responsive web dashboard.
                    </p>
                    <p>
                        Alerts are triggered for high pollution levels or severe weather events, making it a valuable tool for urban, industrial, or residential settings.
                    </p>
                </div>
            </div>
        </div>
    );
};


const Dashboard = () => {
    const tempRef = useRef(null);
    const humidityRef = useRef(null);
    const airQualityRef = useRef(null);
    const gasMq2Ref = useRef(null);
    const gasMq4Ref = useRef(null);
    const dustRef = useRef(null);

    const tempChartRef = useRef(null);
    const humidityChartRef = useRef(null);
    const airQualityChartRef = useRef(null);
    const gasMq2ChartRef = useRef(null);
    const gasMq4ChartRef = useRef(null);
    const dustChartRef = useRef(null);

    const [data, setData] = useState([]);
    const [averages, setAverages] = useState({
        temperature: 0,
        humidity: 0,
        air_quality: 0,
        gas_mq2: 0,
        gas_mq4: 0,
        dust: 0,
    });
    const [timeRanges, setTimeRanges] = useState({
        temperature: "today",
        humidity: "today",
        air_quality: "today",
        gas_mq2: "today",
        gas_mq4: "today",
        dust: "today",
    });


    const MAX_TODAY_DATA_POINTS = 50;
    const [quality, setQuality] = useState({}); // Added to store Good/Medium/Bad status
    const [overallStatus, setOverallStatus] = useState("Good"); // Default to Good

    // Fetch data from API
    const fetchData = async () => {
        try {
            const response = await fetch("http://4.231.99.148:8000/pollution/data");
            const result = await response.json();
            setData((prevData) => {
                const combinedData = [...prevData, ...result];
                const uniqueData = Array.from(new Map(combinedData.map((item) => [item.id, item])).values());
                uniqueData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                return uniqueData;
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // Calculate averages for today's data
    const calculateAverages = (allData) => {
        const today = new Date().toDateString();
        const todayData = allData.filter((entry) => new Date(entry.timestamp).toDateString() === today);

        const keys = ["temperature", "humidity", "air_quality", "gas_mq2", "gas_mq4", "dust"];
        const sums = {};
        const counts = {};

        keys.forEach((key) => {
            sums[key] = 0;
            counts[key] = 0;
        });

        todayData.forEach((entry) => {
            keys.forEach((key) => {
                if (entry[key] != null) {
                    sums[key] += entry[key];
                    counts[key] += 1;
                }
            });
        });

        const avg = {};
        keys.forEach((key) => {
            avg[key] = counts[key] > 0 ? (sums[key] / counts[key]).toFixed(2) : 0;
        });

        const { qualityStatuses, scores } = calculateQuality(avg);

        // Calculate total score
        const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

        // Determine overall environment status
        let overallStatus = "Good";
        if (totalScore >= 16) {
            overallStatus = "Bad";
        } else if (totalScore >= 11) {
            overallStatus = "Moderate";
        }

        setAverages(avg);
        setQuality(qualityStatuses); // Update quality status
        setOverallStatus(overallStatus); // Update overall status
    };



    const calculateQuality = (averages) => {
        const qualityStatuses = {};
        const scores = {};

        // Temperature
        if (averages.temperature < 15 || averages.temperature > 30) {
            qualityStatuses.temperature = "Bad";
            scores.temperature = 3;
        } else if (averages.temperature < 20 || averages.temperature > 26) {
            qualityStatuses.temperature = "Medium";
            scores.temperature = 2;
        } else {
            qualityStatuses.temperature = "Good";
            scores.temperature = 1;
        }

        // Humidity
        if (averages.humidity < 20 || averages.humidity > 80) {
            qualityStatuses.humidity = "Bad";
            scores.humidity = 3;
        } else if (averages.humidity < 30 || averages.humidity > 60) {
            qualityStatuses.humidity = "Medium";
            scores.humidity = 2;
        } else {
            qualityStatuses.humidity = "Good";
            scores.humidity = 1;
        }

        // Air Quality
        if (averages.air_quality > 3000) {
            qualityStatuses.air_quality = "Bad";
            scores.air_quality = 3;
        } else if (averages.air_quality >= 1000) {
            qualityStatuses.air_quality = "Medium";
            scores.air_quality = 2;
        } else {
            qualityStatuses.air_quality = "Good";
            scores.air_quality = 1;
        }

        // Gas MQ2
        if (averages.gas_mq2 > 2000) {
            qualityStatuses.gas_mq2 = "Bad";
            scores.gas_mq2 = 3;
        } else if (averages.gas_mq2 >= 500) {
            qualityStatuses.gas_mq2 = "Medium";
            scores.gas_mq2 = 2;
        } else {
            qualityStatuses.gas_mq2 = "Good";
            scores.gas_mq2 = 1;
        }

        // Gas MQ4
        if (averages.gas_mq4 > 2000) {
            qualityStatuses.gas_mq4 = "Bad";
            scores.gas_mq4 = 3;
        } else if (averages.gas_mq4 >= 500) {
            qualityStatuses.gas_mq4 = "Medium";
            scores.gas_mq4 = 2;
        } else {
            qualityStatuses.gas_mq4 = "Good";
            scores.gas_mq4 = 1;
        }

        // Dust
        if (averages.dust > 200) {
            qualityStatuses.dust = "Bad";
            scores.dust = 3;
        } else if (averages.dust >= 100) {
            qualityStatuses.dust = "Medium";
            scores.dust = 2;
        } else {
            qualityStatuses.dust = "Good";
            scores.dust = 1;
        }

        return { qualityStatuses, scores };
    };

    const sendDataToBackend = async (data) => {
        try {
            const response = await fetch("http://4.231.99.148:8000/pollution/api/save-status/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            console.log("Data sent successfully:", result);
        } catch (error) {
            console.error("Error sending data to backend:", error);
        }
    };
    useEffect(() => {
        if (overallStatus) {
            // Prepare data to send to backend
            const dataToSend = {
                timestamp: new Date().toISOString(),
                overall_status: overallStatus,
                averages: { ...averages },
                quality: { ...quality },
            };

            sendDataToBackend(dataToSend);
        }
    }, [overallStatus]);




    // Polling every 3 seconds
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        calculateAverages(data);
    }, [data]);

    // Filter data based on time range
    const filterDataByTimeRange = (allData, timeRange) => {
        const now = new Date();
        let filteredData = [];

        if (timeRange === "today") {
            filteredData = allData.filter((entry) => new Date(entry.timestamp).toDateString() === now.toDateString());
            return filteredData.slice(-MAX_TODAY_DATA_POINTS);
        } else if (timeRange === "yesterday") {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            filteredData = allData.filter((entry) => new Date(entry.timestamp).toDateString() === yesterday.toDateString());
        } else if (timeRange === "last7days") {
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            filteredData = allData.filter((entry) => new Date(entry.timestamp) >= sevenDaysAgo);
        } else if (timeRange === "last30days") {
            const thirtyDaysAgo = new Date(now);
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            filteredData = allData.filter((entry) => new Date(entry.timestamp) >= thirtyDaysAgo);
        } else if (timeRange === "last2months") {
            const twoMonthsAgo = new Date(now);
            twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
            filteredData = allData.filter((entry) => new Date(entry.timestamp) >= twoMonthsAgo);
        } else if (timeRange === "last6months") {
            const sixMonthsAgo = new Date(now);
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            filteredData = allData.filter((entry) => new Date(entry.timestamp) >= sixMonthsAgo);
        }

        return filteredData;
    };

    // Create or update chart
    const createOrUpdateChart = (chartRef, canvasRef, labels, dataset) => {
        if (!canvasRef.current) return;

        if (!chartRef.current) {
            chartRef.current = new Chart(canvasRef.current.getContext("2d"), {
                type: "line",
                data: {
                    labels,
                    datasets: dataset,
                },
                options: {
                    responsive: true,
                    animation: false,
                    plugins: {
                        legend: { position: "top" },
                        title: { display: true, text: dataset[0].label },
                    },
                    scales: {
                        x: { title: { display: true, text: "Timestamp" } },
                        y: { title: { display: true, text: "Values" } },
                    },
                },
            });
        } else {
            const chart = chartRef.current;
            chart.data.labels = labels;
            chart.data.datasets = dataset;
            chart.update();
        }
    };

    useEffect(() => {
        Object.entries({
            temperature: tempRef,
            humidity: humidityRef,
            air_quality: airQualityRef,
            gas_mq2: gasMq2Ref,
            gas_mq4: gasMq4Ref,
            dust: dustRef,
        }).forEach(([key, canvasRef]) => {
            const filteredData = filterDataByTimeRange(data, timeRanges[key]);

            const labels = filteredData.map((entry) => new Date(entry.timestamp).toLocaleTimeString());
            createOrUpdateChart(
                {
                    temperature: tempChartRef,
                    humidity: humidityChartRef,
                    air_quality: airQualityChartRef,
                    gas_mq2: gasMq2ChartRef,
                    gas_mq4: gasMq4ChartRef,
                    dust: dustChartRef,
                }[key],
                canvasRef,
                labels,
                [
                    {
                        label: `${key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")} Data`,
                        data: filteredData.map((entry) => (entry[key] != null ? entry[key] : 0)),
                        borderColor: "rgba(75, 192, 192, 1)",
                        backgroundColor: "rgba(75, 192, 192, 0.2)",
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: 0,
                    },
                ]
            );
        });
    }, [data, timeRanges]);

    return (
        <div className="dashboard-container">
            {/* Modern Averages Section */}
            <div className="averages-section">
                <h3>Today's Live Update</h3>
                <div className="averages-cards">
                    {[
                        { key: "temperature", title: "Temperature" },
                        { key: "humidity", title: "Humidity" },
                        { key: "air_quality", title: "Air Quality" },
                        { key: "gas_mq2", title: "Combustible Gases" },
                        { key: "gas_mq4", title: "Methane Gas" },
                        { key: "dust", title: "Dust Concentration" },
                    ].map(({ key, title }) => (
                        <div className="card" key={key}>
                            <h4>{title}</h4>
                            <p>
                                {averages[key]}{" "}
                                {key === "temperature" ? "°C" : key === "humidity" ? "%" : key === "dust" ? "µg/m³" : "PPM"}
                            </p>
                            <p>
                                <span
                                    style={{
                                        fontWeight: "bold",
                                        color:
                                            quality[key] === "Good"
                                                ? "green"
                                                : quality[key] === "Medium"
                                                    ? "orange"
                                                    : "red",
                                    }}
                                >
                                    {quality[key]}
                                </span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>


            <div className="overall-status">
                <h3>Overall Environment Status</h3>
                <p
                    style={{
                        fontWeight: "bold",
                        color:
                            overallStatus === "Good"
                                ? "green"
                                : overallStatus === "Moderate"
                                    ? "orange"
                                    : "red",
                    }}
                >
                    {overallStatus}
                </p>
            </div>

            <div className="chart-grid">
                {[
                    { key: "temperature", title: "Temperature" },
                    { key: "humidity", title: "Humidity" },
                    { key: "air_quality", title: "Air Quality" },
                    { key: "gas_mq2", title: "Combustible Gases" },
                    { key: "gas_mq4", title: "Methane Gas" },
                    { key: "dust", title: "Dust Concentration" },
                ].map(({ key, title }) => (
                    <div className="chart-wrapper" key={key}>
                        <h3>{title}</h3>
                        <label>
                            Time Range:
                            <select
                                value={timeRanges[key]}
                                onChange={(e) =>
                                    setTimeRanges((prev) => ({ ...prev, [key]: e.target.value }))
                                }
                            >
                                <option value="today">Today</option>
                                <option value="yesterday">Yesterday</option>
                                <option value="last7days">Last 7 Days</option>
                                <option value="last30days">Last 30 Days</option>
                                <option value="last2months">Last 2 Months</option>
                                <option value="last6months">Last 6 Months</option>
                            </select>
                        </label>
                        <canvas
                            ref={{
                                temperature: tempRef,
                                humidity: humidityRef,
                                air_quality: airQualityRef,
                                gas_mq2: gasMq2Ref,
                                gas_mq4: gasMq4Ref,
                                dust: dustRef,
                            }[key]}
                        ></canvas>
                    </div>
                ))}
            </div>

        </div>
    );
};




const App = () => {
    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <h1 className="app-title">Weather Pollution Monitoring</h1>
                    <nav className="menu-bar">
                        <ul className="menu-list">
                            <li className="menu-item"><Link to="/dashboard" className="menu-link">Dashboard</Link></li>
                            <li className="menu-item"><Link to="/about" className="menu-link">About</Link></li>
                        </ul>
                    </nav>
                </header>

                <main className="main-content">
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/about" element={<About />} />
                    </Routes>
                </main>

                <footer className="footer">
                    <p>&copy; 2025. All rights reserved.</p>
                </footer>
            </div>
        </Router>
    );
};

export default App;
