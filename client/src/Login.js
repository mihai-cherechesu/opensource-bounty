import { useNavigate } from "react-router-dom"
import { IconGitHub } from "./assets"
import { Card, Spacer, Button, Text, Container } from "@nextui-org/react"
import { useEffect, useState } from 'react';


const CLIENT_ID = "76cfd539e20fe2120972";

function loginWithGithub(){
    window.location.assign("https://github.com/login/oauth/authorize?client_id=" + CLIENT_ID)
}

const Login = () => {
	const navigate = useNavigate()

	return (
		<Container display='flex' alignItems='center' justify='center' css={{ minHeight: "100vh" }}>
			<Card css={{ mw: "420px", p: "20px" }}>
				<Text
					size={24}
					weight='bold'
					css={{
						as: "center",
						mb: "20px",
					}}
				>
					Login with
				</Text>
				<Spacer y={1} />
				<Button color='gradient' auto ghost onClick={() => loginWithGithub()}>
					<IconGitHub />
					<Spacer x={0.5} />
					GitHub
				</Button>
				<Spacer y={1} />
			</Card>
		</Container>
	)
}

export default Login