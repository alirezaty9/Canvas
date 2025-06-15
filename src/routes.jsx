import React from 'react';
import Home from "./pages/Home";
import Layout from "./components/Layout";


const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
  
   
    ],
  },
];

export default routes;