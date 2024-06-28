import { expect, it } from 'bun:test'
import { withMigrations } from './migrations'

it('should deserialize old state and apply migrations', () => {
	const { deserialize } = withMigrations({
		version: 1,
		migrations: {
			1: () => 'new data',
		},
	})

	expect(deserialize('{"version":0,"data":"old data"}')).toEqual('new data')
})

it('should apply multiple migrations', () => {
	const { deserialize } = withMigrations({
		version: 5,
		migrations: {
			1: () => 'data 1',
			2: () => 'data 2',
			3: () => 'data 3',
			4: () => 'data 4',
			5: () => 'data 5',
		},
	})

	expect(deserialize('{"version":0,"data":"old data"}')).toEqual('data 5')
})

it('should serialize data with version info', () => {
	const { serialize } = withMigrations({
		version: 1,
		migrations: {
			1: () => 'new data',
		},
	})

	expect(serialize('new data')).toEqual('{"version":1,"data":"new data"}')
})

it('should handle old data without versioning', () => {
	const { deserialize, serialize } = withMigrations({
		version: 1,
		migrations: {
			1: (data: unknown) => ({
				...data as object,
				new: 'new data',
			}),
		},
	})
	const migratedData = deserialize('{"old":"data without version"}')

	expect(migratedData).toEqual({
		old: 'data without version',
		new: 'new data',
	})
	expect(serialize(migratedData)).toEqual('{"version":1,"data":{"old":"data without version","new":"new data"}}')
})
