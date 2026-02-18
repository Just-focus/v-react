import ReactDom from 'react-dom/client';

function App() {
  return (
    <div>
      <span>可以正常渲染嘛</span>
    </div>
  );
}

ReactDom.createRoot(document.getElementById('root')!).render(<App />);
