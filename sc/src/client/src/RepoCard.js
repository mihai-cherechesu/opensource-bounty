import React from "react";
import {
  makeStyles,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  Grid,
} from "@material-ui/core";
import { languageColors } from './assets/colors'
import Axios from "axios";
import { purple } from "@material-ui/core/colors";
import { Button, Col, Container, Navbar, Row, Text, User } from "@nextui-org/react"
import {GitBranchIcon, StarFillIcon, ZapIcon} from '@primer/octicons-react'
import FileUploader from "./FileUploader";
import { Octokit } from '@octokit/core';
import { getAccessTokenGithub, getUserDataGithub } from "./services/services"
import { WalletProvider, WALLET_PROVIDER_DEVNET } from "@multiversx/sdk-web-wallet-provider";
import { Transaction } from "@multiversx/sdk-core";
import qs from "qs";

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 0,
    marginTop: "10px",
    marginBottom: "10px",
    display: "flex",
  },
  card: {
    width: "100%",
    marginLeft: "15px",
    marginRight: "15px",
    margin: "auto",
    transition: "0.3s",
    minHeight: "270px",
    borderRadius: ".625rem!important",
    boxShadow: "0 8px 40px -12px rgba(0,0,0,0.3)",
    "&:hover": {
      boxShadow: "0 16px 70px -12.125px rgba(0,0,0,0.3)",
    },
  },
  tittle: {
    "&:active": {
      color: "#00008E",
    },
  },
  cardContent: {
    minHeight: "120px",
  },
  cardActions: {
    padding: "16px",
  },
  avatar: {
    color: theme.palette.getContrastText(purple[500]),
    backgroundColor: purple[500],
  },
  dot: {
    height: "12px",
    width: "12px",
    borderRadius: "50%",
    display: "inline-block",
  },
}));

function registerUser() {
  console.log("register me!")
}

const RepoCard = ({ repo, language, githubUsername }) => {
  const classes = useStyles();

  return (
    <Grid xs={12} sm={6} lg={3} className={classes.root} item={true}>
      <Card className={classes.card}>
        <CardHeader
          avatar={
            <Avatar aria-label="recipe" className={classes.avatar} src={repo.owner.avatar_url}>
              <span
                className="octicon octicon-repo"
                style={{ fontSize: "20px" }}
              ></span>
            </Avatar>
          }
          title={
            <Typography variant="h6">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className={classes.tittle}
                style={{ textDecoration: "none", color: "#551A8B" }}
              >
                {repo.name}
              </a>{" "}
            </Typography>
          }
        />

        <CardContent className={classes.cardContent}>
          <Typography variant="body1">{repo.description}</Typography>
        </CardContent>
        <CardActions className={classes.cardActions}>
          {repo.language ? (
            <React.Fragment>
              <span
                className={classes.dot}
                style={{ backgroundColor: languageColors[repo.language]["color"] }}
              ></span>
              <Typography style={{ marginRight: "10px" }}>
                {repo.language}
              </Typography>
            </React.Fragment>
          ) : null}
          {repo.stargazers_count >= 0 ? (
            <React.Fragment>
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: "none",
                  marginRight: "10px",
                  color: "#551A8B",
                }}
              >
                <span className="octicon octicon-star">
                  {repo.stargazers_count}
                </span>
              </a>
            </React.Fragment>
          ) : null}
          {repo.forks_count >= 0 ? (
            <React.Fragment>
              <a
                href={`${repo.html_url}/fork`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: "none",
                  marginRight: "10px",
                  color: "#551A8B",
                }}
              >
                <span className="octicon octicon-repo-forked">
                  {repo.forks_count}
                </span>
              </a>
            </React.Fragment>
          ) : null}
            <React.Fragment>
                <FileUploader handleFile={handleFile} />
            </React.Fragment>
        </CardActions>
      </Card>
    </Grid>
  );
};

export const callRegisterUser = async (username) => {
  const provider = new WalletProvider(WALLET_PROVIDER_DEVNET);
  const hex = require('string-hex')
  const callbackUrl = encodeURIComponent("http://localhost:3000/home");
  await provider.login({ callbackUrl });

  const queryString = window.location.search.slice(1);
  const params = qs.parse(queryString);

  console.log(username);
  console.log("own address: ", params.address);
  

  const firstTransaction = new Transaction({
      "chainId": "D",
      "data": "register_issue" + "@" + hex(username),
      "gasLimit": 10000000,
      "receiver": "erd1qqqqqqqqqqqqqpgqmajgt3zq6mp8g8yewqvpqst4pjhm84j3uyhqxpf7z9",
      "sender": params.address,
    });

  let r = await provider.signTransactions(
      [firstTransaction],
      { callbackUrl: callbackUrl }
  );

  let data = firstTransaction.toSendable();
  let url = "https://devnet-api.multiversx.com/transactions";
  let response = await Axios.post(url, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  let txHash = response.data.txHash;
  console.log(txHash);
}

function handleFile(fileUploaded) {
  let reader = new FileReader();
  reader.readAsText(fileUploaded);
  
  reader.onload = function() {
    const accessToken = localStorage.getItem("accessToken")

    getUserDataGithub(accessToken).then((data) => {
      console.log("username: ", data.login);
      
      const sodium = require('libsodium-wrappers')
      const secret = reader.result; // replace with the secret you want to encrypt
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
          secret_name: data.login + "_PEM_SECRET",
          encrypted_value: output,
          key_id: '568250167242549743',
          // headers: {s
          //   'X-GitHub-Api-Version': '2022-11-28'
          // }
        })
      })

      callRegisterUser(data.login).then((r) => {
        console.log(r);
      }
      );
    })
  };
  
  reader.onerror = function() {
    console.log(reader.error);
  };
}

export default RepoCard;
