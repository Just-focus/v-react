import { useState, useEffect } from 'react';
import ReactDom from 'react-dom/client';

function Child() {
  useEffect(() => {
    console.log('Child mount');
    return () => {
      console.log('Child unmount');
    };
  }, []);
  return 'i am child';
}

function App() {
  const [num, setNum] = useState(0);

  useEffect(() => {
    console.log('App mount');
  }, []);

  useEffect(() => {
    console.log('num changed', num);

    return () => {
      console.log('num changed unmount', num);
    };
  }, [num]);

  function handleClick() {
    setNum(1);
  }

  return <div onClick={handleClick}>{num === 0 ? <Child /> : <span>{num}</span>}</div>;
}

ReactDom.createRoot(document.getElementById('root')!).render(<App />);
