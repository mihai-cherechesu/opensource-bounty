import React, { Component } from "react";
import Axios from "axios";
import RepoCard from "./RepoCard";
import { Grid } from "@material-ui/core";
import { useEffect, useState } from 'react';
import { Octokit } from '@octokit/core';

function compare(a, b) {
  if (a.stargazers_count > b.stargazers_count) return -1;
  else if (a.stargazers_count < b.stargazers_count) return 1;
  else if ((a.stargazers_count = b.stargazers_count)) {
    if (a.forks_count > b.forks_count) return -1;
    else if (a.forks_count < b.forks_count) return 1;
    else return 0;
  }
}

const ownerRepoMap = {
  "kubernetes": "kubernetes",
  "torvalds": "linux",
  "MihaiCherechesu": "bucharest-hackathon-mmap",
  "hashicorp": "consul",
  "kata-containers": "kata-containers",
  "cri-o": "cri-o",
  "containernetworking": "cni",
  "multiversx": "mx-sdk-go",
}

const GitHubCards = () => {
  const [repoState, setRepoState] = useState({
    repo: [],
    language: [],
  });

  const getUserReposGithub = async (owner, repo) => {
    const octokit = new Octokit({
      auth: localStorage.getItem("accessToken")
    })
    
    const r = await octokit.request('GET /repos/{owner}/{repo}', {
      owner: owner,
      repo: repo,
      // headers: {
      //   'X-GitHub-Api-Version': '2022-11-28'
      // }
    })

    return r
  };

  useEffect(() => {
    let repoResults = [];

    for (const [key, value] of Object.entries(ownerRepoMap)) {
      getUserReposGithub(key, value).then(resp => {
        repoResults.push(resp.data)
      })
    }

    setRepoState({
      repo: repoResults,
      language: null
    });
  }, []);

  const { repo, language } = repoState;
  const filtered = repo.sort(compare);
  const reducedrepo = filtered.slice(0, 8);

    return (
      <Grid container spacing={1}>
        {reducedrepo.map((data, i) => (
          <RepoCard repo={data} key={i} language={language} />
        ))}
      </Grid>
    );
}

export default GitHubCards;
