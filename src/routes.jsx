import React from 'react';
import SimpleHome from "./pages/SimpleHome";
import Layout from "./components/Layout";


const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <SimpleHome /> },
  
   
    ],
  },
];

export default routes;