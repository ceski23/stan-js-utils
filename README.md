# stan-js utils

This package is UNOFFICIAL set of utils for use with [stan-js](https://github.com/codemask-labs/stan-js).

## withMigrations

This is small util that helps to maintain backward compatibility of state when persisting it e.g. in `localStorage`. It accepts one parameter - configuration object with few params:
- `version` - this is current version of your state, you should increase it each time you change your state in non-backwards compatible way
- `migrations` - object with state migrations, each key is version number and value is function which will get old state and should return migrated state
- `serialize`/`deserialize` - custom (de)serializer, same as in [stan-js](<https://codemask-labs.github.io/stan-js/reference/synchronizer/#:~:text=%7D)-,Custom%20serializer,-If%20you%20want>)

### Small example

Let's say you stored user info in store and persisted it in `localStorage`:

```ts
type UserData = {
    username: string
}

const store = createStore({
  user: storage<UserData | null>(null, {
    ...withMigrations({
      version: 0,
      migrations: {},
    }),
  }),
})
```

Then, after some time you decide that you also want to have user's name in that state. You now have to do two steps:
1. increase state's version 
2. add migration to new shape

```ts
const userDataV0Schema = z.object({
  username: z.string(),
})

type UserData = {
  username: string
  name: string
}

const store = createStore({
  user: storage<UserData | null>(null, {
    ...withMigrations({
      version: 1,
      migrations: {
        1: (prev: unknown) => {
          const { success, data } = userDataV0Schema.safeParse(prev)
		      return success ? { ...data, name: data.username } : null
		    },
	    },
	  }),
  }),
})
```

In above example we declare migration from version 0 to 1 which is using `zod` to parse data and add new property. In the future if you change state's shape again you will have to repeat those steps.

Let's add `age` property:

```ts
const userDataV0Schema = z.object({
  username: z.string(),
})

const userDataV1Schema = userDataV0Schema.extend({
  name: z.string(),
})

type UserData = {
  username: string
  name: string
}

const store = createStore({
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
```