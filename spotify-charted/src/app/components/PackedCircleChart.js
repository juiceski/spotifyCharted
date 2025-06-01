"use client";

import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

const PackedCircleChart = ({ data }) => {
    const chartRef = useRef(null);
    const [chartInstance, setChartInstance] = useState(null);
    const [numGenres, setNumGenres] = useState(10);

    useEffect(() => {
        // Initialize the chart when the component mounts
        const chart = echarts.init(chartRef.current);
        setChartInstance(chart);

        return () => {
            // Cleanup chart on unmount
            if (chartInstance) {
                chartInstance.dispose();
            }
        };
    }, []);

    useEffect(() => {
        if (!chartInstance || !data.length) return;

        const topGenres = data.sort((a, b) => b.value - a.value).slice(0, numGenres); // Get only the top 10 genres

        const options = {
            tooltip: {
                formatter: "{b}: {c} songs",
            },
            series: [
            {
                type: "graph",
                layout: "circular",
                symbolSize: (value) => Math.sqrt(value) * 10, // Scale the size of the circles based on song count
                itemStyle: {
                    borderColor: "#fff",
                    borderWidth: 1,
                    shadowBlur: 10,
                    shadowColor: "rgba(0, 0, 0, 0.3)",
                },
                label: {
                    show: true,
                    position: "inside",
                    formatter: "{b}",
                    color: "#fff",
                },
                force: {
                    repulsion: 100,
                    gravity: 0.2,
                    edgeLength: 30
                },
                data: topGenres.map((genre) => ({
                    name: genre.name,
                    value: genre.value,
                    itemStyle: {
                        color: getRandomColor(), // Random color for each genre
                    },
                })),
            },
            ],
        };

        // Set the options on the chart instance
        chartInstance.setOption(options);
    }, [data, chartInstance]);

    const getRandomColor = () => {
        // Function to generate a random color for each circle
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const handleGenreSelection = (event) => {
        setNumGenres(Number(event.target.value)); // Update the number of genres to display
        const newTopGenres = data.sort((a, b) => b.value - a.value).slice(0, numGenres);
        chartInstance.setOption({
            series: [
            {
                data: newTopGenres.map(genre => ({
                    name: genre.name,
                    value: genre.value,
                    itemStyle: {
                        color: getRandomColor()
                    }
                }))
            }
            ]
        });
    };

    return (
        <div>
            <div className="mb-4">
                <label htmlFor="numGenres" className="text-white mr-2">Select number of genres:</label>
                <select id="numGenres" value={numGenres} onChange={handleGenreSelection} className="bg-gray-700 text-white p-2 rounded">
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                </select>
            </div>

            <div ref={chartRef} style={{ width: "100%", height: "500px" }} />
        </div>
    );
};

export default PackedCircleChart;
