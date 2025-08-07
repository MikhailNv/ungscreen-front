import React from 'react';
import CandlestickPagination from './CandlestickPagination'
import CandlestickSettings from './CandlestickSettings';
import './Params.css';


const Header = () => {
  return (
    <div className='params'>
        <CandlestickSettings />
        <CandlestickPagination />
    </div>
  );
};

export default Header;