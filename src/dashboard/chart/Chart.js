import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios'
import { Select, ConfigProvider } from 'antd';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import "./Chart.css"

const CandlestickChart = ({symbol, interval}) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const wsRef = useRef(null);
  const isLoadingHistoryRef = useRef(false); // Ref для актуального состояния
  const [isConnected, setIsConnected] = useState(false);
  const chartInterval = useRef(1);
  const currentCandleRef = useRef(null);
  const oldestTimestampRef = useRef(null);
  // const resizeObserver = useRef();

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
          interval: chartInterval.current,
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
    if (!wsRef.current) { 
      wsRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/${symbol}/${chartInterval.current}`);
      wsRef.current.interval = chartInterval.current;
      wsRef.current.symbol = symbol;
    }
    else if (wsRef.current.interval !== chartInterval.current) {
      wsRef.current.close()
      wsRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/${symbol}/${chartInterval.current}`);
      wsRef.current.interval = chartInterval.current;
      wsRef.current.symbol = symbol;
    }

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        processCandleData(data["data"]);
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
    if (isLoadingHistoryRef.current) return;

    isLoadingHistoryRef.current = true;

    axios.get("http://127.0.0.1:8000/kline-history", {
      params: {
        category: 'linear',
        symbol: symbol,
        interval: chartInterval.current,
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

  const handleIntervalChange = (_, option) => {
    chartInterval.current = parseInt(option.value)
    processCoinHistory();
  };

  return (
    <div className="chart-nav-wrapper">
      <div className="chart-nav">
        <ConfigProvider
          theme={{
            token: {
              // Seed Token
              // colorPrimary: '#1A1A1A',
              // colorBorder: '#1A1A1A',
              // colorText: 'white',
              // colorIcon: 'white',
              // borderRadius: 2,

              // Alias Token
              // colorBgContainer: '#1A1A1A',
            },
          }}
        >
          <Select
            activeBorderColor='red'
            size='small'
            defaultValue="1"
            style={{ width: "70px", height: "100%" }}
            onSelect={handleIntervalChange}
            options={[
              { value: '1', label: '1м' },
              { value: '3', label: '3м' },
              { value: '5', label: '5м' },
              { value: '15', label: '15м'},
            ]}
          />
        </ConfigProvider>
        <div className="chart-nav-item chart-nav-item-center">{symbol}</div>
        <div className="chart-nav-item chart-nav-item-right">сохранить</div>
      </div>
      <div className="chart-wrapper">
        <div className="chart-container" ref={chartContainerRef} id={`chart-${symbol}`} />
      </div>
    </div>
  );
};

export default CandlestickChart;