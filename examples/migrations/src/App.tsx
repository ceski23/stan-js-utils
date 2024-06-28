import { store } from './store'

export const App = () => {
	const { user, setUser } = store.useStore()

	const setUserV0 = () => {
		window.localStorage.setItem(
			'user',
			JSON.stringify({
				data: { username: 'admin' },
			}),
		)
		window.location.reload()
	}

	const setUserV1 = () => {
		window.localStorage.setItem(
			'user',
			JSON.stringify({
				version: 1,
				data: { username: 'johny123', name: 'John' },
			}),
		)
		window.location.reload()
	}

	return (
		<div>
			<pre>{JSON.stringify(user, undefined, 2)}</pre>
			<button onClick={() => setUser(null)}>Clear user</button>
			<button onClick={setUserV0}>Set user v0 and reload</button>
			<button onClick={setUserV1}>Set user v1 and reload</button>
			<button onClick={() => setUser({ username: 'amy123', age: 29, name: 'Amy' })}>Set user to Amy</button>
		</div>
	)
}
