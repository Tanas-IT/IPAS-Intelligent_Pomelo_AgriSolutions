import { Fragment } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { publicRoutes } from "./routes/RouterApp";
import { GuestLayout } from "./layouts";
import "aos/dist/aos.css";
import { ToastContainer } from "react-toastify";
import { ScrollToTop } from "./components";
import { ConfigProvider } from "antd";
import { themeColors } from "./styles";
import { NotFoundPage } from "./pages";
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
    <ToastContainer />
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: themeColors.highlight,
            boxShadow: "none",
            boxShadowSecondary: "none",
          },
          components: {
            Input: {
              activeShadow: "none",
            },
            InputNumber: {
              activeShadow: "none",
            },
            Select: {
              optionSelectedColor: themeColors.primary,
              optionSelectedBg: themeColors.secondary,
              activeOutlineColor: "none",
            },
            DatePicker: {
              cellActiveWithRangeBg: themeColors.secondary,
            },
            Segmented: {
              itemSelectedBg: themeColors.secondary,
              itemSelectedColor: themeColors.primary,
            },
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
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </Router>
      </ConfigProvider>
    </>
  );
}

export default App;
