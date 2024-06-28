import { createStore } from 'stan-js'
import { storage } from 'stan-js/storage'
import { z } from 'zod'
import { withMigrations } from '../../../src/migrations'

const userDataV0Schema = z.object({
	username: z.string(),
})

const userDataV1Schema = userDataV0Schema.extend({
	name: z.string(),
})

type UserData = {
	username: string
	name: string
	age: number
}

export const store = createStore({
	user: storage<UserData | null>(null, {
		...withMigrations({
			version: 2,
			migrations: {
				1: (prev: unknown) => {
					const { success, data } = userDataV0Schema.safeParse(prev)
					return success ? { ...data, name: data.username } : null
				},
				2: (prev: unknown) => {
					const { success, data } = userDataV1Schema.safeParse(prev)
					return success ? { ...data, age: 0 } : null
				},
			},
		}),
	}),
})
