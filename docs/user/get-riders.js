export default {
  get: {
    tags: ["User operations"], // operation's tag.
    description: "Get Riders", // operation's desc.
    operationId: "getRiders", // unique operation id
    parameters: [],
    // expected responses
    responses: {
      // response code
      200: {
        description: "Riders found", // response desc.
        content: {
          // content-type
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Rider", // user data model
            },
          },
        },
      },
      401: {
        description: "Rider not authenticated", // response desc.
        content: {
          // content-type
          "application/json": {
            schema: {
              $ref: "#/components/schemas/NotAuth", // error data model
            },
          },
        },
      },
      // response code
      404: {
        description: "Rider not found", // response desc.
        content: {
          // content-type
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error", // error data model
            },
          },
        },
      },
    },
  },
};
