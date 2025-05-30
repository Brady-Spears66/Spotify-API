import axios from "axios";

const Home = () => {
  const login = async () => {
    const res = await axios.get("http://127.0.0.1:5000/login-url");
    window.location.href = res.data.url;
  };

  return (
    <div>
      <h1>Welcome to Spotify Insights</h1>
      <button onClick={login}>Login with Spotify</button>
    </div>
  );
};

export default Home;
