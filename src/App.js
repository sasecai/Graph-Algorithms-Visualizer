import logo from './logo.svg';
import './App.css';
import GraphVisualizer from './GraphVisualizer/GraphVisualizer'
import Canvas from './GraphVisualizer/Canvas'

function App() {
  return (
    <div className="App"> 
      <GraphVisualizer></GraphVisualizer>
    </div>
  );
  //return <Canvas/>
}

export default App;
