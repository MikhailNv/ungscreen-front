import CandlestickChart from './chart/Chart';
import "./Dashboard.css"


function Dashboard() {
    return (
        <div className="dashboard">
            <CandlestickChart symbol="BTCUSDT" interval={1}/>
            <CandlestickChart symbol="ETHUSDT" interval={1}/>
            <CandlestickChart symbol="KAITOUSDT" interval={1}/>

            <CandlestickChart symbol="TRUMPUSDT" interval={1}/>
            <CandlestickChart symbol="SOLUSDT" interval={1}/>
            <CandlestickChart symbol="XRPUSDT" interval={1}/>
        </div>
    )
}

export default Dashboard;