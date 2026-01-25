import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import './app.css'
import Trainers from './Pages/trainer/Trainer';
import Play from './Pages/play/Play';

function App() {
  return (
    <>
      {/* <BrowserRouter> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Play />} />
        <Route path="/venues" element={<Home />} />
        <Route path="/trainer" element={<Trainers />} />
      </Routes>
      {/* </BrowserRouter> */}
    </>
  )
}

export default App
