import CandlestickChart from './chart/EChart';
import './App.css';

function App() {
  return (
    <div className="dashboard">
      <div className="chart-wrapper">
        <CandlestickChart symbol="KAITOUSDT"/>
      </div>
      <div className="chart-wrapper">
        <CandlestickChart symbol="KAITOUSDT"/>
      </div>
      <div className="chart-wrapper">
        <CandlestickChart symbol="KAITOUSDT"/>
      </div>
      {/* <CandlestickChart symbol="BTCUSDT"/> */}
      {/* <div style={{background: "black"}}></div>
      <div style={{background: "red"}}></div>
      <div style={{background: "blue"}}></div> */}
    </div>
  );
}

export default App;