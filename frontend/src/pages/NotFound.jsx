import { Link } from "react-router-dom";
import SEO from "../components/SEO.jsx";

export default function NotFound() {
  return (
    <>
      <SEO title="Page Not Found" description="This page doesn't exist." path="/404" />
      <section className="container" style={{ textAlign: "center", padding: "120px 24px" }}>
        <h1>Page not found</h1>
        <p style={{ margin: "0 auto 24px" }}>The page you're looking for has moved or doesn't exist.</p>
        <Link className="btn btn-primary" to="/">Back to Home</Link>
      </section>
    </>
  );
}
