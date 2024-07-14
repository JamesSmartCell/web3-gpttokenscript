import type { ChatRequestOptions } from "ai";
export const functionSchemas: ChatRequestOptions["functions"] = [
  {
    name: "deploy_contract",
    description: "Deploy a smart contract",
    parameters: {
      type: "object",
      description:
        "This function deploys a smart contract to an EVM compatible chain.  It returns the tx hash of the deployment and an IPFS url to a directory of files used for the contract.  Only call this function in a separate chat message do not call it from a message with other text.  Share the explorer url and ipfs url with the user.",
      properties: {
        contractName: {
          type: "string",
        },
        chainId: {
          type: "string",
          description: `Default chainId is 5003.
          Supported chainIds:
          17000: holesky,
          84532: base sepolia,
          80002: polyogn amoy,
          11155111: sepolia,
          5003: mantle sepolia,
          421614: arbitrum sepolia,
          `,
        },
        sourceCode: {
          type: "string",
          description:
            "Source code of the smart contract. Format as a single-line string, with all line breaks and quotes escaped to be valid stringified JSON.",
        },
        constructorArgs: {
          type: "array",
          items: {
            oneOf: [
              {
                type: "string",
              },
              {
                type: "array",
                items: {
                  type: "string",
                },
              },
            ],
          },
          description:
            "Array of arguments for the contract's constructor. Don't use any constructor placeholders for setScriptURI - this will be set once contract is deployed. Each Array item a string or an array of strings.  Empty array if the constructor has no arguments.",
        },
      },
      required: ["contractName", "sourceCode", "constructorArgs"],
    },
  },
  {
    name: "text_to_image",
    description:
      "This function generates an image from text.  Only call this function in a separate chat message do not call it from a message with other text.  Show the image to the user using the default IPFS gateway ipfs.io/ipfs/{CID} in markdown.  Use the metadata as the baseTokenURI if creating an NFT.",
    parameters: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Text to generate an image from.",
        },
      },
      required: ["text"],
    },
  },
];
