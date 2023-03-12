import { useEffect, useState } from 'react';
import { Octokit } from '@octokit/core';
import { useNavigate } from "react-router-dom"
import { EnvironmentsEnum } from '@multiversx/sdk-dapp/types';
import { LogOutIcon } from "./assets"
import { Button, Col, Container, Navbar, Row, Text, User } from "@nextui-org/react"
import { getAccessTokenGithub, getUserDataGithub } from "./services/services"
import {
    TransactionsToastList,
    SignTransactionsModals,
    NotificationModal
} from '@multiversx/sdk-dapp/UI';
import {
    DappProvider,
    AxiosInterceptorContext // using this is optional
} from '@multiversx/sdk-dapp/wrappers';

import {
    apiTimeout,
    walletConnectV2ProjectId,
    sampleAuthenticatedDomains
} from './config';
import { Unlock } from './Unlock';
import GitHubCards from './GitHubCards';

const CLIENT_ID = "76cfd539e20fe2120972";


function Home() {

  const [rerender, setRerender] = useState(false);
  const [userData, setUserData] = useState({});
  const [comments, setComments] = useState([]);
  const [userDataGithub, setUserDataGithub] = useState(null);
  const navigate = useNavigate()

  const setLogOut = () => {
    localStorage.removeItem("accessToken")
    navigate("/login")
  }

  useEffect(() => {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const codeParam = urlParams.get("code");
      const accessToken = localStorage.getItem("accessToken")
  
    //   if(codeParam && (localStorage.getItem("accessToken") === null)){
    //     async function getAccessToken(){
    //       await fetch("http://localhost:4000/getAccessToken?code=" + codeParam, {
    //         method: "GET"
    //       }).then((response) => {
    //         return response.json();
    //       }).then((data) => {
    //         console.log(data);
    //         if(data.access_token){
    //           localStorage.setItem("accessToken", data.access_token);
    //           console.log("setting local storage", data.access_token);
    //           setRerender(!rerender);
    //         }
    //     })
    //     }

    //     getAccessToken();
    //     getUserData();
    // }
        if (!accessToken) {
            getAccessTokenGithub(codeParam).then(resp => {
                localStorage.setItem("accessToken", resp.access_token)
                getUserDataGithub(resp.access_token).then((data) => {
                    // console.log("data when accesstoken not good: ", data.avatar_url, data.login, data.bio)
                    if (data.avatar_url === undefined || data.login === undefined || data.bio === undefined) {
                        console.log("undefined data")
                    } else {
                        setUserDataGithub({ avatar_url: data.avatar_url, login: data.login, bio: data.bio})
                    }
                })
            })
        } else if (accessToken) {
			getUserDataGithub(accessToken).then((data) => {
				localStorage.setItem("accessToken", accessToken)
                if (data.avatar_url === undefined || data.login === undefined || data.bio === undefined) {
                    console.log("undefined data")
                } else {
				    setUserDataGithub({avatar_url: data.avatar_url, login: data.login, bio: data.bio})
                }
			})
		}
    }, []);

    // if (!userDataGithub) return null

    // async function getUserData() {
    //     console.log("Token from local storage", localStorage.getItem("accessToken"))
    //     await fetch("http://localhost:4000/getUserData", {
    //       method: "GET",
    //       headers: {
    //         "Authorization" : "Bearer " + localStorage.getItem("accessToken")
    //       }
    //     }).then((response) => {
    //       return response.json();
    //     }).then((data) => {
    //       console.log(data);
    //       setUserDataGithub({avatar_url: data.avatar_url, login: data.login, bio: data.bio})
    //     })
    //   }

//   async function getIssueComments() {
//     try {
//       const octokit = new Octokit({ auth: localStorage.getItem("accessToken") });
//       const response = await octokit.request('GET /repos/{owner}/{repo}/issues/comments', {
//         owner: 'torvalds',
//         repo: 'linux',
//         // headers: {
//         //   'X-GitHub-Api-Version': '2022-11-28'
//         // }
//       });
//       const response2 = await octokit.request('GET /repos/{owner}/{repo}/issues', {
//         owner: 'MihaiCherechesu',
//         repo: 'bucharest-hackathon-mmap',
//         // headers: {
//         //   'X-GitHub-Api-Version': '2022-11-28'
//         // }
//       })

      // const sodium = require('libsodium-wrappers')
      // const secret = 'plain-text-secret' // replace with the secret you want to encrypt
      // const key = 'XBMrhSRQXB2aHh8NFIaIEIMNHbC8hytFdmrVuyIAdwg=' // replace with the Base64 encoded public key

      // //Check if libsodium is ready and then proceed.
      // sodium.ready.then(() => {
      //   const octokit = new Octokit({ auth: "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"});
      //   // Convert Secret & Base64 key to Uint8Array.
      //   let binkey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL)
      //   let binsec = sodium.from_string(secret)

      //   //Encrypt the secret using LibSodium
      //   let encBytes = sodium.crypto_box_seal(binsec, binkey)
        
      //   // Convert encrypted Uint8Array to Base64
      //   let output = sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL)
  
      //   let r = octokit.request('PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}', {
      //     owner: 'MihaiCherechesu',
      //     repo: 'bucharest-hackathon-mmap',
      //     secret_name: 'SECRET_NAME',
      //     encrypted_value: output,
      //     key_id: '568250167242549743',
      //     // headers: {s
      //     //   'X-GitHub-Api-Version': '2022-11-28'
      //     // }
      //   })

//         console.log(r)
//       });
//       console.log("Issues response is:", response)
//       console.log("CUriozi tisu:", response2)
//       const commentTexts = response.data.map(comment => comment.body);
//       setComments(commentTexts);
//     } catch (error) {
//       console.error(error);
//     }
//   }

  return (
    <>
    <Navbar isBordered variant='sticky'>
        <Navbar.Brand>
            <User
                bordered
                color='primary'
                size='lg'
                src={userDataGithub?.avatar_url}
                name={userDataGithub?.login}
                description={userDataGithub?.bio}
            />
        </Navbar.Brand>
        <Navbar.Content>
            <Navbar.Item>
                <Button
                    auto
                    flat
                    size='sm'
                    icon={<LogOutIcon fill='currentColor' />}
                    color='primary'
                    onClick={() => setLogOut()}
                >
                    Log out
                </Button>
            </Navbar.Item>
        </Navbar.Content>
    </Navbar>
    <GitHubCards githubUsername={userDataGithub?.login} />
    {/* <AxiosInterceptorContext.Provider>
      <AxiosInterceptorContext.Interceptor
        authenticatedDomanis={sampleAuthenticatedDomains}
      >
          <DappProvider
            environment={EnvironmentsEnum.devnet}
            customNetworkConfig={{
              name: 'customConfig',
              apiTimeout,
              walletConnectV2ProjectId
            }}
          >
            <AxiosInterceptorContext.Listener />
            <TransactionsToastList />
            <NotificationModal />
            <SignTransactionsModals className='custom-class-for-modals' />
            <Unlock/>
          </DappProvider>
      </AxiosInterceptorContext.Interceptor>
    </AxiosInterceptorContext.Provider> */}
    </>
  );
}

export default Home;
