import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Planner from './pages/Planner';
import Result from './pages/Result';
import Detail from './pages/Detail';
import Layout from './components/Layout';
import './styles/global.css';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/result" element={<Result />} />
          <Route path="/detail/:contentId" element={<Detail />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
