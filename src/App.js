import Nav from './header/Header'
import Params from './params/Params'
import Dashboard from './dashboard/Dashboard'
import React from 'react';
import './App.css';

function App() {
  return (
    <>
      <div className="base-wrapper">
        <Nav />
        <Params />
        <Dashboard />
      </div>
    </>
  );
}

export default App;