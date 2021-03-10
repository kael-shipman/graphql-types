Basic GraphQL Type Building Blocks
===========================================================================

This library defines a small, basic set of types that aid in interacting with a GraphQL server.
Additionally, it defines a helper function, `projectionToString`, that makes it easy to convert a
`Projection` object into a GraphQL-compatible type string.

### `Projection` Type

The `Projection` type is a type describing a _projection_ of a full type for the purposes of
GraphQL. Note that GraphQL projections ignore arrays, so this type strips out arrays from the
original input type. The goal is to be able to pass in a `Projection` object that can be used to
programmatically generate a GraphQL type string using `projectionToStrign` and then subsequently to
generate a matching return type definition.

### `Result` Type

The `Result` type describes a concrete result based on the given projection object.

### Example

```ts
// Define a base type for your domain
type User = {
  id: string;
  email: string;
  approved: string;
  address: {
    street1: string;
    city: string;
    state: string;
    country: {
      code: string;
      allowed: boolean;
    }
  };
  docs: Array<{
    id: string;
    url: string;
    approved: boolean;
  }>
}

// Define a function that accepts a projection of your User type and returns a result based on that
// projection
const getUser = async <P extends Projection<User>>(id: string, p: P): Promise<Result<User, P>> => {
  // It is assumed that you have some sort of generic GraphQL client which will return an object
  // with a `data` key and possible an `errors` array.
  const result = await myGraphQLServer.request<Result<User, P>>(`query($id: String!) {
    user(id: $id) ${projectionToString(p)}
  }`);

  // Throw any errors
  if (result.errors && result.errors.length > 0) {
    throw new Error(`Errors: .....`);
  }

  // If we're all good, then return the expected data
  return result.data;
}

// Now use the function with a given projection to get a result
const res = getUser("1", {
  id: false,
  email: true,
  address: {
    country: {
      code: true
    }
  },
  docs: {
    id: true,
    url: true
  }
});
 
console.log(res.id);                   // << Type: never
console.log(res.email);                // << Type: string
console.log(res.docs.length);          // << Value: 2
console.log(res.docs[0]!.id);          // << Type: string
console.log(res.address.country.code); // << Type: string

// Try another one
const res2 = getUser("1", { email: true });
console.log(res2.docs);                // << ERROR: docs is not defined on type { email: string }
```

