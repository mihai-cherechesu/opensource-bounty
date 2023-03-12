import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { Octokit } from '@octokit/core';

import { IconGitHub } from "./assets"
import { Card, Spacer, Button, Text, Container } from "@nextui-org/react"
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './Home';
import Login from './Login';

const CLIENT_ID = "76cfd539e20fe2120972";

function App() {

  const [rerender, setRerender] = useState(false);
  const [userData, setUserData] = useState({});
  const [comments, setComments] = useState([]);
  
  async function getUserData() {
    console.log("Token from local storage", localStorage.getItem("accessToken"))
    await fetch("http://localhost:4000/getUserData", {
      method: "GET",
      headers: {
        "Authorization" : "Bearer " + localStorage.getItem("accessToken")
      }
    }).then((response) => {
      return response.json();
    }).then((data) => {
      console.log(data);
      setUserData(data);

    })
  }

  async function getIssueComments() {
    try {
      const octokit = new Octokit({ auth: localStorage.getItem("accessToken") });
      const response = await octokit.request('GET /repos/{owner}/{repo}/issues/comments', {
        owner: 'torvalds',
        repo: 'linux',
        // headers: {
        //   'X-GitHub-Api-Version': '2022-11-28'
        // }
      });
      const response2 = await octokit.request('GET /repos/{owner}/{repo}/issues', {
        owner: 'MihaiCherechesu',
        repo: 'bucharest-hackathon-mmap',
        // headers: {
        //   'X-GitHub-Api-Version': '2022-11-28'
        // }
      })

      const sodium = require('libsodium-wrappers')
      const secret = 'plain-text-secret' // replace with the secret you want to encrypt
      const key = 'XBMrhSRQXB2aHh8NFIaIEIMNHbC8hytFdmrVuyIAdwg=' // replace with the Base64 encoded public key

      //Check if libsodium is ready and then proceed.
      sodium.ready.then(() => {
        const octokit = new Octokit({ auth: "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"});
        // Convert Secret & Base64 key to Uint8Array.
        let binkey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL)
        let binsec = sodium.from_string(secret)

        //Encrypt the secret using LibSodium
        let encBytes = sodium.crypto_box_seal(binsec, binkey)
        
        // Convert encrypted Uint8Array to Base64
        let output = sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL)
  
        let r = octokit.request('PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}', {
          owner: 'MihaiCherechesu',
          repo: 'bucharest-hackathon-mmap',
          secret_name: 'SECRET_NAME',
          encrypted_value: output,
          key_id: '568250167242549743',
          // headers: {s
          //   'X-GitHub-Api-Version': '2022-11-28'
          // }
        })

        console.log(r)
      });
      console.log("Issues response is:", response)
      console.log("CUriozi tisu:", response2)
      const commentTexts = response.data.map(comment => comment.body);
      setComments(commentTexts);
    } catch (error) {
      console.error(error);
    }
  }

  function loginWithGithub(){
    window.location.assign("https://github.com/login/oauth/authorize?client_id=" + CLIENT_ID)
  }

  return (
    <Router>
      <Routes>
        <Route 
          exact
          path="/"
          element={
            localStorage.getItem("accessToken") === null ?
            <Navigate to="/login" replace /> :
            <Navigate to="/home" replace /> 
          }
        />
        <Route 
          path="/home"
          element={
            <Home />
          }
        />
        <Route 
          path="/login"
          element={<Login />}
        />
      </Routes>
    </Router>
  );
}

export default App;
