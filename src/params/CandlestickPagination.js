import React, { useState } from 'react';
import { ConfigProvider, Pagination } from 'antd';
import './CandlestickPagination.css';


const CandlestickPagination = () => {
    const [current, setCurrent] = useState(1);
    const onChange = page => {
        console.log(page);
        setCurrent(page);
    };

    return (
        <div className='candlestick-pagination-wrapper'>
            <ConfigProvider
            theme={{
                components: {
                    Pagination: {
                        colorBgContainer: "#272727",
                        colorBorder: "#747474",
                        controlOutline: "#747474",
                        colorPrimary: "#747474",
                        colorPrimaryHover: "#747474",
                        colorText: "#747474",
                        colorTextDisabled: "#404040"
                    },
                },
            }}
            >
                <Pagination simple current={current} onChange={onChange} total={50} />
            </ConfigProvider>
        </div>
    );
};

export default CandlestickPagination;