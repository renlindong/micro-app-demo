import './App.css'
import MicroApp from './components/MicroApp'

function App() {

  return (
    <div className="App">
      <div>主应用</div>
      <MicroApp
        style={{ width: '200px', height: '300px' }}
        src="http://localhost:3001"
      />
    </div>
  )
}

export default App
