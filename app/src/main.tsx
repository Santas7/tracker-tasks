import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";

import "@mantine/core/styles.css";

import { MantineProvider } from "@mantine/core";
import { BrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { store } from "./core/store/store.ts";

createRoot(document.getElementById("root")!).render(
  <MantineProvider>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </MantineProvider>,
);
