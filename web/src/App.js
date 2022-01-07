import React from "react";
import { Routes, Route } from 'react-router-dom';
import Home from './views/Home';
import styled from 'styled-components';
import 'antd/dist/antd.css';

const MainContainer = styled.main`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    font-family: Geneva, Verdana, sans-serif;
`;

function App() {
  return (
    <MainContainer>
      <Routes>
        <Route path='/' element={<Home />} exact />
      </Routes>
    </MainContainer>
  );
}

export default App;
