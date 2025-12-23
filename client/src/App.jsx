import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TV from './pages/TV';
import Remote from './pages/Remote';
import Admin from './pages/Admin';
import GameEnd from './pages/GameEnd';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/tv" element={<TV />} />
        <Route path="/remote" element={<Remote />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/game-end" element={<GameEnd />} />
        <Route path="/" element={<TV />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

