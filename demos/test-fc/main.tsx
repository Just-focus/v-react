import { useState } from 'react';
import ReactDom from 'react-dom/client';

function App() {
  const [num] = useState(0);

  return (
    <div>
      {/* <span>可以正常渲染嘛</span> */}
      <span>{num}</span>
    </div>
  );
}

ReactDom.createRoot(document.getElementById('root')!).render(<App />);
