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

  function handleClick() {
    setNum((prevNum) => prevNum + 1);
    setNum((prevNum) => prevNum + 2);
    setNum((prevNum) => prevNum + 3);
  }

  return (
    <>
      <span onClick={handleClick}>{num}</span>
      {/* <Child /> */}
    </>
  );
}

ReactDom.createRoot(document.getElementById('root')!).render(<App />);
