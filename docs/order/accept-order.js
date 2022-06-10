export default {
  post: {
    tags: ["Order operations", "Rider operations"], // operation's tag.
    description: "Accept New Order", // operation's desc.
    operationId: "acceptOrder", // unique operation id
    parameters: [
      // expected params.
    ],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/OrderIn",
          },
        },
        // param desc.
      },
    },
    // expected responses
    responses: {
      // response code
      200: {
        description: "Order accepted", // response desc.
        content: {
          // content-type
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Success"
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
      500: {
        description: "Error accepting order", // response desc.
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
