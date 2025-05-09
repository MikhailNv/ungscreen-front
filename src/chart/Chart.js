
import { AreaSeries, CandlestickSeries, createChart, ColorType } from 'lightweight-charts';
import React, { useState, useEffect, useRef } from 'react';

export const ChartComponent = ({data}) => {
    const chartContainerRef = useRef();

    useEffect(
        () => {
            console.log("IN USEEFFECT")
            const handleResize = () => {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            };

            const chart = createChart(chartContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: 'black' }
                },
                width: chartContainerRef.current.clientWidth,
                height: 300,
            });
            chart.timeScale().fitContent();

            const newSeries = chart.addSeries(CandlestickSeries, {
                upColor: '#26a69a',
                downColor: '#ef5350',
                borderVisible: false,
                wickUpColor: '#26a69a',
                wickDownColor: '#ef5350',
            });
            console.log("DATA: ", data)
            if (data) { newSeries.setData(data); };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);

                chart.remove();
            };
        },
        [data]
    );

    return (
        <div
            ref={chartContainerRef}
        />
    );
};


const Data = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        setData(...data, [1])
        console.log(data)
    })

    return (
        <>{data}</>
    )
}


export function Chart() {
    const [data, setData] = useState([]);

    const ws = useRef(null);

    useEffect(() => {
        if (!ws.current) { ws.current = new WebSocket("ws://127.0.0.1:8000/ws"); };
        // ws.current = new WebSocket("ws://127.0.0.1:8000/ws");
        ws.current.onopen = () => console.log("ws opened");
        ws.current.onclose = () => console.log("ws closed");
        ws.current.onmessage = msg => {
            const message = JSON.parse(msg.data);
            setData((prevData) => [...prevData, message])
        };

        const wsCurrent = ws.current;

        return () => {
            if (wsCurrent.readyState === WebSocket.OPEN) {
                wsCurrent.close();
            }
        };
    }, []);

    return (
        <ChartComponent data={data} />
        // <Data />
    );
}