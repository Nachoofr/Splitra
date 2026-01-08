import React from "react";
import "./global.css";
import { Redirect } from "expo-router";

const Home = () => {
  return <Redirect href="/login" />;
};

export default Home;
