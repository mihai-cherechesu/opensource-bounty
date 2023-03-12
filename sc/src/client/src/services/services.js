import axios from "axios"

export const getAccessTokenGithub = async (code) => {
	const { data } = await axios.get(`http://localhost:4000/getAccessToken?code=${code}`, {
		headers: {
			"Content-Type": "application/json",
		},
	})

	return data
}

export const getUserDataGithub = async (accessToken) => {
	const { data } = await axios.get(`http://localhost:4000/getUserData`, {
		headers: {
			"Content-Type": "application/json",
            "Authorization" : "Bearer " + accessToken
		},
	})
	return data
}