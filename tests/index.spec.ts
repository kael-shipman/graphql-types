import * as Lib from "../src";

// Define a basic "user" type
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

describe("Basic GraphQL Types", () => {
  test("typings work as expected", () => {
    // Define a function that accepts a projection of a User and returns a result based
    // on that projection
    const testUser = <T extends Lib.Projection<User>>(p: T): Lib.Result<User, T> => {
      const result: any = {
        email: "me@us.com",
        address: {
          country: {
            code: "US"
          }
        },
        docs: [
          {
            id: "1",
            url: "https://abcde.com/docs/1"
          },
          {
            id: "2",
            url: "https://abcde.com/docs/2"
          }
        ]
      }
      return result;
    }

    const res = testUser({
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

    expect(typeof res.id).toBe("undefined");
    expect(typeof res.email).toBe("string");
    expect(typeof res.address).toBe("object");
    expect(typeof res.address.country).toBe("object");
    expect(typeof res.address.country.code).toBe("string");
    expect(typeof res.address.country.code).toBe("string");
    expect(Array.isArray(res.docs)).toBe(true);
    expect(typeof res.docs[0]).toBe("object");
    expect(typeof res.docs[0].id).toBe("string");
    expect(typeof res.docs[0].url).toBe("string");

    // Should fail if uncommented:
    //expect(typeof res.nonexistent).toBe("undefined");
  });

  test("projectionToString converts projections to GraphQL type strings", () => {
    const str = Lib.projectionToString({
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

    expect(str).toBe("{ email, address { country { code } }, docs { id, url } }");
  });
});
