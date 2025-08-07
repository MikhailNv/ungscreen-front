import React from 'react';
import HeaderLogo from './HeaderLogo';
import Nav from './Nav';
import './Header.css';


const Header = () => {
  return (
    <div className='header'>
      <HeaderLogo />
      <Nav />
    </div>
  );
};

export default Header;