import { useState } from "react";
import type { ReactElement } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";

// React コンポーネントの返り値の型は JSX.Element
function AppTest(): ReactElement {
  const viteLogo = `${import.meta.env.BASE_URL}vite.svg`;
  // useState の型を number と明示
  const [count, setCount] = useState<number>(0);

  // ボタンクリック時の関数
  const increment = (): void => {
    setCount((prevCount) => prevCount + 1);
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <h1>Vite + React + TypeScript</h1>

      <div className="card">
        {/* 型安全なクリックイベント */}
        <button type="button" onClick={increment}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default AppTest;
