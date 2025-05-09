import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios'
import { createChart, CandlestickSeries } from 'lightweight-charts';

const CandlestickChart = ({symbol}) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const wsRef = useRef(null);
  const isLoadingHistoryRef = useRef(false); // Ref для актуального состояния
  const [isConnected, setIsConnected] = useState(false);
  const currentCandleRef = useRef(null);
  const oldestTimestampRef = useRef(null);

  const HISTORY_CHUNK_SIZE = 500

  // Загрузка дополнительной истории
  const loadMoreHistory = useCallback(async () => {
    if (!oldestTimestampRef.current || isLoadingHistoryRef.current) return;

    isLoadingHistoryRef.current = true;

    try {
      const response = await axios.get(`http://127.0.0.1:8000/kline-history`, {
        params: {
          category: 'linear',
          symbol: symbol,
          interval: 1,
          limit: HISTORY_CHUNK_SIZE,
          end: oldestTimestampRef.current - 60 // Запрашиваем данные до текущей oldest точки
        }
      });

      if (response.data.length > 0) {
        oldestTimestampRef.current = response.data[0].time;
        currentCandleRef.current = [
          ...response.data,
          ...currentCandleRef.current,
        ];
        candleSeriesRef.current?.setData(currentCandleRef.current);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      isLoadingHistoryRef.current = false;
    }
  }, [symbol]);

  // Обновление последней свечи
  const updateCandleStick = (updatedLastCandlestick) => {
    let last_candlestick = currentCandleRef.current[currentCandleRef.current.length - 1]

    last_candlestick = {
      ...last_candlestick,
      high: Math.max(last_candlestick.high, updatedLastCandlestick.high),
      low: Math.min(last_candlestick.low, updatedLastCandlestick.low),
      close: updatedLastCandlestick.close
    };

    currentCandleRef.current[currentCandleRef.current.length - 1] = last_candlestick
    
    // Обновляем только последнюю свечу на графике
    candleSeriesRef.current?.update(last_candlestick);
  };

  // Добавление новой свечи
  const setNewCandleStick = (newCandleStickData) => {
    currentCandleRef.current = [
      ...currentCandleRef.current,
      newCandleStickData
    ];
    
    // Обновляем график (все исторические свечи + новая текущая)
    candleSeriesRef.current?.setData(currentCandleRef.current);
  };

  // Инициализация истории свечей
  const initCandleStickHistory = (candleStickHistory) => {
    currentCandleRef.current = candleStickHistory;
    oldestTimestampRef.current = candleStickHistory[0].time;
    
    // Обновляем график (все исторические свечи + новая текущая)
    candleSeriesRef.current?.setData(currentCandleRef.current);
  };

  // Обработка данных свечи
  const processCandleData = useCallback((data) => {
    const frame_transition = data.length === 2 ? true : false;

    // Если это первая свеча или пришла новая свеча (по времени start)
    if (frame_transition) {
      updateCandleStick(data[0]);
      setNewCandleStick(data[1]);
    } else {
      updateCandleStick(data[0]);
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    if (!wsRef.current) { wsRef.current = new WebSocket("ws://127.0.0.1:8000/ws"); };

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        processCandleData(data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      setTimeout(connectWebSocket, 5000);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      wsRef.current?.close();
    };
  }, [processCandleData]);

  // Обработка данных свечи
  const processCoinHistory = useCallback(() => {
    console.log("IN PROCESS COIN HISTORY")
    if (isLoadingHistoryRef.current) return;

    isLoadingHistoryRef.current = true;

    axios.get("http://127.0.0.1:8000/kline-history", {
      params: {
        category: 'linear',
        symbol: symbol,
        interval: 1,
        limit: HISTORY_CHUNK_SIZE
      }
    }).then((resp) => {
      initCandleStickHistory(resp.data);
      connectWebSocket();
    }).catch(error => {
      console.error('Error loading initial history:', error);
    }).finally(() => {
      isLoadingHistoryRef.current = false;
    });
  }, [symbol, connectWebSocket]);

  // Инициализация графика
  useEffect(() => {
    if (!chartContainerRef.current) return;

    console.log("IN USEEFFECT")

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: '#222' },
        textColor: '#DDD',
      },
      autoSize: true,
      // width: chartContainerRef.current.clientWidth,
      // height: chartContainerRef.current.clientHeight,
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          visible: false,
        }
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    const candleSeries = chart.addSeries(
      CandlestickSeries,
      {
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      }
    );

    candleSeriesRef.current = candleSeries;

    // Обработчик прокрутки для подгрузки истории
    const handleVisibleRangeChange = (newRange) => {
      if (!newRange || isLoadingHistoryRef.current) return;
      if (newRange.from < 0.1) loadMoreHistory();
    };
    chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);


    const watermarks = document.querySelectorAll('#tv-attr-logo');
    watermarks.forEach((watermark) => {
      watermark.style.display = 'none';
    });

    processCoinHistory();

    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
      chartRef.current?.remove();
    };
  }, [loadMoreHistory, processCoinHistory]);

  return (
    // <div style={{ width: '100%', height: '100%' }}>
    //   {isLoadingHistoryRef.current && (
    //     <div style={{
    //       position: 'absolute',
    //       top: 10,
    //       left: '50%',
    //       transform: 'translateX(-50%)',
    //       zIndex: 100,
    //       backgroundColor: 'rgba(0,0,0,0.7)',
    //       color: 'white',
    //       padding: '5px 10px',
    //       borderRadius: 4,
    //     }}>
    //       Loading historical data...
    //     </div>
    //   )}
    //   <div style={{
    //     position: 'absolute',
    //     top: 10,
    //     right: 10,
    //     zIndex: 100,
    //     backgroundColor: isConnected ? '#4CAF50' : '#F44336',
    //     color: 'white',
    //     padding: '5px 10px',
    //     borderRadius: 4,
    //   }}>
    //     {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
    //   </div>
    //   <div ref={chartContainerRef} style={{ width: '200px', height: '100px' }} />
    // </div>
    <div className="chart-container" ref={chartContainerRef} id={`chart-${symbol}`} />
  );
};

export default CandlestickChart;