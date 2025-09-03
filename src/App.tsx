import "./App.css";
import { ChatBox } from "./chatbox";
import { Button } from "./components/ui/button";
import { useWebGpuHandler } from "./packges/qwen3-webgpu";

function App() {
  const { load, progressItems,  } = useWebGpuHandler({ autoload: false });
  return (
    <>
      <div className="">
        <pre>{JSON.stringify(progressItems, undefined, 2)}</pre>
        <Button onClick={load}>Load</Button>
        <ChatBox />
      </div>
    </>
  );
}

export default App;
