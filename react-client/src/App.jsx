import './App.css'
import StickerPeel from './components/StickerPeel'
import logo from './assets/react.svg'

function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Sticker Peel</h1>
      <StickerPeel
        imageSrc={logo}
        width={300}
        rotate={0}
        peelBackHoverPct={20}
        peelBackActivePct={70}
        shadowIntensity={0.05}
        lightingIntensity={0.09}
        initialPosition={{ x: -100, y: 100 }}
      />
    </div>
  )
}

export default App
