import { Fragment } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { publicRoutes } from "./routes/RouterApp";
import { GuestLayout } from "./layouts";
import "aos/dist/aos.css";
import { ToastContainer } from "react-toastify";
import { ScrollToTop } from "./components";
import { ConfigProvider } from "antd";

function App() {
  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#326E2F",
          },
        }}
      >
        <Router>
          <ScrollToTop />
          <div className="App">
            <Routes>
              {publicRoutes.map((route, index) => {
                const Layout = route.layout === null ? Fragment : route.layout || GuestLayout;
                const Page = route.component;
                return (
                  <Route
                    key={index}
                    path={route.path}
                    element={
                      <Layout>
                        <Page />
                      </Layout>
                    }
                  />
                );
              })}
            </Routes>
          </div>
        </Router>
        <ToastContainer />
      </ConfigProvider>
    </>
  );
}

export default App;
