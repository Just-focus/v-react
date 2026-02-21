import { useState, Fragment } from 'react';
import ReactDom from 'react-dom/client';

function Child() {
  return (
    <div>
      <>
        <span>Child1</span>
        <span>Child2</span>
      </>
    </div>
  );
}

function App() {
  const [num, setNum] = useState(0);

  return (
    <>
      <span>App</span>
      <Child />
    </>
  );
}

ReactDom.createRoot(document.getElementById('root')!).render(<App />);
