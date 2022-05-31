export default {
  post: {
    tags: ["Rider operations"], // operation's tag.
    description: "Add Rider Personal Info", // operation's desc.
    operationId: "addPersonalInfo", // unique operation id
    parameters: [
      // expected params.
      {
        name: "first_name", // name of the param
        in: "body", // location of the param
        schema: {
          type: "String",
          example: "Oghenero",
        },
        required: true, // Mandatory param
        description: "First name provided", // param desc.
      },
      {
        name: "last_name", // name of the param
        in: "body", // location of the param
        schema: {
          type: "String",
          example: "Ologe",
        },
        required: true, // Mandatory param
        description: "Last name provided", // param desc.
      },
      {
        name: "email", // name of the param
        in: "body", // location of the param
        schema: {
          type: "String",
          example: "example@gmail.com",
        },
        required: true, // Mandatory param
        description: "Email provided", // param desc.
      },
    ],
    // expected responses
    responses: {
      // response code
      200: {
        description: "Personal Info added successfully", // response desc.
        content: {
          // content-type
          "application/json": {
            schema: {
              message: {
                type: "String",
                example: "Personal info added successfully",
              },
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
        description: "Error adding personal info", // response desc.
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
