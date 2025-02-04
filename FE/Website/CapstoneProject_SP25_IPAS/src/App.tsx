import { Fragment } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { publicRoutes } from "./routes/RouterApp";
import { GuestLayout } from "./layouts";
import "aos/dist/aos.css";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <Router>
        {/* <ScrollToTop /> */}
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
    </>
  );
}

export default App;
