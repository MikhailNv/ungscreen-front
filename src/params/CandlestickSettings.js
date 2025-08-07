import React, { useState } from 'react';
import { SettingOutlined } from '@ant-design/icons';
import './CandlestickSettings.css';


const CandlestickSettings = () => {
    const [iconToggled, setIconToggled] = useState(false);
    return (
        <div className='candlestick-settings-wrapper'>
            <div className='candlestick-settings'>
                <div className='name'>
                    <h4>Параметры</h4>
                </div>
                <div className='icon-wrapper'>
                    <SettingOutlined
                    className={`icon ${iconToggled ? "icon-active" : null }`}
                    onClick={() => setIconToggled(!iconToggled)}
                    />
                </div>
            </div>
        </div>
    );
};

export default CandlestickSettings;