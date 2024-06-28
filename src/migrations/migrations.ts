type Versions<TVersion extends number, TAcc extends Array<number> = [1]> = TVersion extends 0 ? never
	: TAcc['length'] extends TVersion ? [...TAcc, TAcc['length']][number]
	: Versions<TVersion, [...TAcc, TAcc['length']]>

type StorageWithMigrationsParams<TData, TVersion extends number> = {
	version?: TVersion
	migrations: {
		[K in Versions<TVersion>]: (data: unknown) => K extends TVersion ? TData : unknown
	}
	deserialize?: (value: string) => TData
	serialize?: (value: TData) => string
}

type VersionedData<T> = {
	version?: number
	data: T
}

const isVersionedData = <T>(data: unknown): data is VersionedData<T> =>
	data !== null && typeof data === 'object' && 'data' in data && 'version' in data

/**
 * Utility function to enchance stan-js's `storage` built-in synchronizer with migrations support
 * @param options.version - current version of the data
 * @param options.migrations - object with migration functions
 * @param options.deserialize - custom deserializer
 * @param options.serialize - custom serializer`
 * @returns serializer and deserializer compatible with stan-js's `storage` built-in synchronizer
 */
export const withMigrations = <TData, TVersion extends number = 0>({
	migrations,
	version = 0 as TVersion,
	deserialize = JSON.parse,
	serialize = JSON.stringify,
}: StorageWithMigrationsParams<TData, TVersion>) => {
	const deserializeWithMigrations = (value: string): TData => {
		const deserializedData = deserialize(value)
		const versionedData = isVersionedData<TData>(deserializedData)
			? deserializedData
			: { version: 0, data: deserializedData }

		return Array
			.from({ length: version - (versionedData.version ?? 0) }, (_, i) => (versionedData.version ?? 0) + i + 1)
			.reduce((data, nextVersion) => {
				const migrationKey = nextVersion as keyof typeof migrations

				if (!migrations[migrationKey]) {
					throw new Error(`Migration to version ${nextVersion} is not found`)
				}

				return migrations[migrationKey](data) as TData
			}, versionedData.data)
	}
	const serializeWithVersion = (data: TData): string => serialize({ version, data } as TData)

	return {
		deserialize: deserializeWithMigrations,
		serialize: serializeWithVersion,
	}
}
