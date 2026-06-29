import MainContent from "./MainContent";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./home.css";

const Home = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="page-container">
          <MainContent />
        </div>
      </main>
    </div>
  );
};

export default Home;
