import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AllTasks from './pages/AllTasks';
import Today from './pages/Today';
import Week from './pages/Week';
import Calendar from './pages/Calendar';
import ListDetail from './pages/ListDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<AllTasks />} />
          <Route path="today" element={<Today />} />
          <Route path="week" element={<Week />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="list/:listId" element={<ListDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
