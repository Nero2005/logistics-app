export default {
  post: {
    tags: ["Payment operations"], // operation's tag.
    description: "Fund Wallet", // operation's desc.
    operationId: "fundWallet", // unique operation id
    parameters: [
      // expected params.
    ],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/FundWallet",
          },
        },
        // param desc.
      },
    },
    // expected responses
    responses: {
      // response code
      200: {
        description: "Flutterwave payment link", // response desc.
        content: {
          // content-type
          "application/json": {
            schema: {
              $ref: "#/components/schemas/PaymentLink",
            },
          },
        },
      },
      401: {
        description: "User not authenticated", // response desc.
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
        description: "Error getting payment link", // response desc.
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
