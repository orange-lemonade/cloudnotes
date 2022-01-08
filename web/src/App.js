import React from "react";
import { Routes, Route } from 'react-router-dom';
import Home from './views/home';
import SharedNote from "./views/sharedNote";
import styled from 'styled-components';
import 'antd/dist/antd.css';

const MainContainer = styled.main`
    //background-color: #0f044c;
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
        <Route path='/note' element={<SharedNote />} exact />
      </Routes>
    </MainContainer>
  );
}

export default App;
