import Sidebar from "./Sidebar";
import Header from "./Header";


export default function Layout({ children, title }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Header title={title} />
        {children}
      </div>
    </div>
  );
}
