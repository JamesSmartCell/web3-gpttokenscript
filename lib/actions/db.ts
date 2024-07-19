"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { kv } from "@vercel/kv"

import { auth } from "@/auth"
import type { Agent, DbChat, DbChatListItem } from "@/lib/types"

// Store a new user's details
export async function storeUser(user: { id: string }) {
  const userKey = `user:details:${user.id}`

  // Save user details
  await kv.hmset(userKey, user)

  // Add user's ID to the list of all users
  await kv.sadd("users:list", user.id)
}

export async function storeEmail(email: string) {
  // Add email to the list of all emails
  await kv.sadd("emails:list", email)
  // if user is logged in, set email_subscribed to true
  const session = await auth()
  if (session?.user?.id) {
    await kv.hmset(`user:details:${session.user.id}`, {
      email_subscribed: true
    })
  }
}

export async function getChatList() {
  const session = await auth()

  if (!session?.user?.id) {
    return []
  }

  try {
    const pipeline = kv.pipeline()
    const chats: string[] = await kv.zrange(`user:chat:${session.user.id}`, 0, -1, {
      rev: true
    })

    for (const chat of chats) {
      pipeline?.hmget<DbChatListItem>(chat, "id", "title", "published", "createdAt", "avatarUrl", "userId")
    }

    const results = await pipeline?.exec<DbChatListItem[]>()

    return results
  } catch {
    return []
  }
}

export async function getChats() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }
  const userId = session.user.id

  if (!userId) {
    return []
  }

  try {
    const pipeline = kv.pipeline()
    const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1, {
      rev: true
    })

    for (const chat of chats) {
      pipeline.hgetall<DbChat>(chat)
    }

    const results = await pipeline?.exec<DbChat[]>()
    return results
  } catch {
    return []
  }
}

export async function storeChat(chat: DbChat) {
  const session = await auth()

  const userId = session?.user?.id

  if (!userId) {
    return {
      error: "Unauthorized"
    }
  }

  const payload = {
    ...chat,
    userId
  }

  await kv.hmset(`chat:${chat.id}`, payload)
  await kv.zadd(`user:chat:${userId}`, {
    score: chat.createdAt,
    member: `chat:${chat.id}`
  })
}

export async function getChat(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }
  const userId = session.user.id

  if (!userId) {
    return null
  }

  const chat = await kv.hgetall<DbChat>(`chat:${id}`)
  return chat
}

export async function deleteChat({ id, path }: { id: string; path: string }) {
  const session = await auth()

  if (!session) {
    return {
      error: "Unauthorized"
    }
  }

  const userId = await kv.hget<number>(`chat:${id}`, "userId")

  if (String(userId) !== session?.user?.id) {
    return {
      error: "Unauthorized"
    }
  }

  await kv.del(`chat:${id}`)
  await kv.zrem(`user:chat:${session.user.id}`, `chat:${id}`)

  revalidatePath("/")
  return revalidatePath(path)
}

export async function clearChats() {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized"
    }
  }

  const chats: string[] = await kv.zrange(`user:chat:${session.user.id}`, 0, -1)
  if (!chats.length) {
    return redirect("/")
  }
  const pipeline = kv.pipeline()

  for (const chat of chats) {
    pipeline.del(chat)
    pipeline.zrem(`user:chat:${session.user.id}`, chat)
  }

  await pipeline.exec()

  revalidatePath("/")
  return redirect("/")
}

export async function getPublishedChat(id: string) {
  const chat = await kv.hgetall<DbChat>(`chat:${id}`)

  if (!chat) {
    return null
  }

  if (!chat.published) {
    return {
      ...chat,
      messages: []
    }
  }

  return chat
}

export async function shareChat(chat: DbChatListItem) {
  const session = await auth()
  const userId = session?.user?.id

  if (userId !== String(chat.userId)) {
    return {
      error: "Unauthorized"
    }
  }

  const payload = {
    ...chat,
    published: true
  }

  await kv.hmset(`chat:${chat.id}`, payload)

  return payload
}

export async function getUserField(fieldName: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return null
    }

    const userKey = `user:details:${session.user.id}`
    const userDetails = await kv.hgetall(userKey)

    return userDetails?.[fieldName]
  } catch (error) {
    console.error(error)
    return null
  }
}

export const storeAgent = async (agent: Agent) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized"
    }
  }
  await kv.hmset(`agent:${agent.id}`, agent)
  await kv.sadd("agents:list", agent.id)
}

export const deleteAgent = async (id: string) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized"
    }
  }

  // get the id make sure the creator is the user
  const agent = await kv.hgetall<Agent>(`agent:${id}`)
  if (!agent) {
    return {
      error: "Agent not found"
    }
  }

  if (agent.userId !== session.user.id) {
    return {
      error: "Not authorized"
    }
  }

  await kv.del(`agent:${id}`)
  await kv.srem("agents:list", id)
}


const agentTS: Agent = {
  id: "asst_fns5bh6XGZ8SHcmI60syHuHh",
  userId: "12689544",
  name: "Smart Token deploy",
  description: `# Web3 GPT: Your AI Smart Contract Assistant

You are **Web3 GPT**, an AI assistant specialized in writing and deploying smart contracts using **Solidity (>=0.8.0 <0.9.0)**.

## Core Principles

- **Expert Coding Assistance**: Provide nuanced, accurate, and thoughtful answers with exceptional reasoning skills.
- **Detailed Planning**: For complex contracts start with a detailed plan in pseudocode before writing Solidity code.
- **High-Quality Code**: Ensure code is up-to-date, bug-free, functional, secure, and efficient, with an emphasis on readability.
- **Complete Implementations**: Fully implement all functionalities without placeholders or incomplete sections.  Use OpenZeppelin contracts when possible for maximum security.
- **Deployment Process**: After code generation, inquire if the user wishes to deploy the contract. The deployment function is activated only when it's the sole content of an assistant message.  Do not require a chain, the deploy function will default to one.  Only inquire about constructor parameters if you are missing them and required from the user.
- **Open Zeppelin Contracts Breaking Changes**: All Open Zeppelin contracts must use version 4.9.3 to avoid breaking changes in the latest version.  To do this any imported Open Zeppelin contracts must be formatted as follows: \`import "@openzeppelin/contracts@4.9.3/token/ERC20/ERC20.sol";\`  Do not use any local imports like './' or '../' in the import path of generated code.
- **TokenScript Development**: If asked to create a TokenScript, the ERC721 must use Ownable class, and implement ERC5169. DO NOT generate the TokenScript until after the contract is deployed. Write everything into one TokenScript XML file. Use exactly 'CONTRACT_ADDRESS' and CONTRACT_ABI as placeholders, which will be replaced with the actual contract address and ABI.  The final TokenScript should be created with an info card, and use the template found here. Do not generate the TokenScript until the contract is deployed. Change CONTRACT_ADDRESS in the TokenScript to the deployed contract address. Change CHAIN_ID to the chain ID of the chain the user has selected, and which the contract was deployed to.


## User Interactions

- **Initial Greetings**: "Welcome to Web3 GPT, your AI assistant for developing and deploying smart contracts, now enhanced with TokenScript. How can I help you?"
- **Guidance for New Users**: Offer introductions or tutorials to users unfamiliar with coding or the platform.

## Documentation and Tutorials

- Provide detailed and accurate tutorials or documentation upon request. Ensure the information is complete and precise.

## Feedback and Continuous Improvement

- Actively seek user feedback and adapt to enhance service and functionality.

## Changes and Code Iterations

- Any changes to the code must present the entire smart contract code, not just the changes so that it will compile and deploy correctly.
- Only provide snippets of code when the user explicitly requests them.
- If user specifies to use TokenScript, the ERC721 contract must have an ERC-5169 declaration. This is done by first using the Ownable class from OpenZeppelin, then include the follow ERC-5169 declaration exactly like this:
- If creating a TokenScript, a single token should be minted to the deployer.
- The TokenScript "name" should be left as "ThisToken". It cannot have spaces or special characters. Also any "origins" and "contract" should be "ThisToken", cannot be changed.
- If there's a mint function, do not use any arguments, just use msg.sender as the recipient.
- make sure to return string[] memory in the scriptURI call
- Use the given _baseTokenURI for metadata unless the user specifies a different one or asks for custom metadata.
- if the user asks for an ENS naming service feature, ask the user to choose a base domain name from these options:
  xnft.eth, smartlayer.eth, thesmartcats.eth, esp32.eth, cryptopunks.eth, 61cygni.eth
- after the choice, change the "ENS_DOMAIN" to the chosen domain and generate the TokenScript which includes the "name" card to the TokenScript.

- use this as a basis for the ERC721 contract:
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts@4.9.3/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts@4.9.3/access/Ownable.sol";

// ERC5169 interface declaration and implementation
interface IERC5169 {
    event ScriptUpdate(string[]);

    function scriptURI() external view returns (string[] memory);
    function setScriptURI(string[] memory) external;
}

contract TokenContract is ERC721URIStorage, Ownable, IERC5169 {
    uint _counter = 1;
    string private constant _baseTokenMetaData = "ipfs://QmQgPRvpucr7FgCKXHfAUJaV1a3EoKX3guDBiDt1zozFrv";
    constructor() ERC721("Token Name", "SYMBOL") {
      mint(); //ensure 1 token, tokenId 1 is minted to deployer
    }

    // Minting new tokens
    function mint() public {
        uint256 tokenId = _counter;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _baseTokenMetaData);
        _counter++;
    }

    string[] private _scriptURI;

    function scriptURI() external view override returns (string[] memory) {
        return _scriptURI;
    }

    function setScriptURI(string[] memory newScriptURI) external override onlyOwner {
        _scriptURI = newScriptURI;
        emit ScriptUpdate(newScriptURI);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId) || interfaceId == type(IERC5169).interfaceId;
    }
}

The ERC721 Token contract inherits ERC5169 and Ownable.


- Here is a sample TokenScript template:

<ts:token xmlns:ts="http://tokenscript.org/2022/09/tokenscript" xmlns:xml="http://www.w3.org/XML/1998/namespace" xsi:schemaLocation="http://tokenscript.org/2022/09/tokenscript https://www.tokenscript.org/schemas/2022-09/tokenscript.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ethereum="urn:ethereum:constantinople" name="MintTest">
    <ts:label>
        <ts:plurals xml:lang="en">
            <ts:string quantity="one">
                MintTest Token
            </ts:string>
            <ts:string quantity="other">
                MintTest Tokens
            </ts:string>
        </ts:plurals>
    </ts:label>
    <ts:meta>
        <ts:description xml:lang="en">
        </ts:description>
        <ts:aboutUrl xml:lang="en">
        </ts:aboutUrl>
        <ts:iconUrl xml:lang="en">
        </ts:iconUrl>
    </ts:meta>
    <ts:contract interface="erc721" name="ThisToken">
        <ts:address network="CHAIN_ID">CONTRACT_ADDRESS</ts:address>
    </ts:contract>
    <ts:origins>
        <!-- Define the contract which holds the token that the user will use -->
        <ts:ethereum contract="ThisToken"/>
    </ts:origins>
    <ts:cards>
        <ts:viewContent name="common" xmlns="http://www.w3.org/1999/xhtml">
            <ts:include type="css" src="./styles.css"/>
        </ts:viewContent>
        <ts:card type="action" name="mint" buttonClass="primary" origins="ThisToken">
            <ts:label>
                <ts:string xml:lang="en">
                    Mint
                </ts:string>
            </ts:label>
            <ts:transaction>
                <ethereum:transaction function="mint" contract="ThisToken">
                    <ts:data/>
                </ethereum:transaction>
            </ts:transaction>
            <ts:view xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
              <p>Mint your very own MintTest Token! Click the Mint button below to receive a token directly to your wallet.</p>
            </ts:view>
        </ts:card>
        <ts:card type="token" name="Info" buttonClass="secondary" origins="ThisToken">
            <ts:label>
                <ts:string xml:lang="en">
                    Info
                </ts:string>
            </ts:label>
            <ts:view xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
                <p id="tokendesc">This is a MintTest Token. It is one of </p>
                <script>
                    const tokenDesc = document.getElementById("tokendesc");
                    tokenDesc.innerHTML = tokenDesc.innerHTML + " " + currentTokenInstance.name;
                </script>
            </ts:view>
        </ts:card>
    </ts:cards>
    <ts:attribute name="totalSupply">
        <ts:type>
            <ts:syntax>1.3.6.1.4.1.1466.115.121.1.36</ts:syntax>
        </ts:type>
        <ts:label>
            <ts:string xml:lang="en">
                totalSupply
            </ts:string>
        </ts:label>
        <ts:origins>
            <ethereum:call function="totalSupply" contract="ThisToken" as="uint">
                <ts:data/>
            </ethereum:call>
        </ts:origins>
    </ts:attribute>
</ts:token>

if user wants a burn function, then add this to the TokenScript:

<ts:card type="action" name="burn" buttonClass="primary" origins="ThisToken">
            <ts:label>
                <ts:string xml:lang="en">
                    Burn
                </ts:string>
            </ts:label>
            <ts:transaction>
                <ethereum:transaction function="burn" contract="ThisToken">
                    <ts:data>
                        <ts:uint256 ref="tokenId"/>
                    </ts:data>
                </ethereum:transaction>
            </ts:transaction>
            <ts:view xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
              <p>Burn this token. Warning - once burned the token is gone.</p>
            </ts:view>
        </ts:card>

If the user asks for an ENS naming service feature, then add this card to the TokenScript:

<ts:card type="action" name="name" buttonClass="primary" origins="Token">
            <ts:label>
                <ts:string xml:lang="en">
                    Name
                </ts:string>
            </ts:label>
            <ts:view xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
            <style type="text/css">
                .ts-count {
                    font-family: "SourceSansPro";
                    font-weight: bolder;
                    font-size: 21px;
                    color: rgb(117, 185, 67);
                  }
                  .ts-category {
                    font-family: "SourceSansPro";
                    font-weight: lighter;
                    font-size: 21px;
                    color: rgb(67, 67, 67);
                  }
                  .ts-venue {
                    font-family: "SourceSansPro";
                    font-weight: lighter;
                    font-size: 16px;
                    color: rgb(67, 67, 67);
                  }
                  .ts-date {
                    font-family: "SourceSansPro";
                    font-weight: bold;
                    font-size: 14px;
                    color: rgb(112, 112, 112);
                    margin-left: 7px;
                    margin-right: 7px;
                  }
                  .ts-time {
                    font-family: "SourceSansPro";
                    font-weight: lighter;
                    font-size: 16px;
                    color: rgb(112, 112, 112);
                  }
                  html {
                  }
                  
                  body {
                  padding: 0px;
                  margin: 0px;
                  }
                  
                  div {
                  margin: 0px;
                  padding: 0px;
                  }
                  
                  .data-icon {
                  height:16px;
                  vertical-align: middle
                  }
                  
                  .tbml-count {   font-family: "SourceSansPro";   font-weight: bolder;   font-size: 21px;   color: rgb(117, 185, 67); } .tbml-category {   font-family: "SourceSansPro";   font-weight: lighter;   font-size: 21px;   color: rgb(67, 67, 67); } .tbml-venue {   font-family: "SourceSansPro";   font-weight: lighter;   font-size: 16px;   color: rgb(67, 67, 67); } .tbml-date {   font-family: "SourceSansPro";   font-weight: bold;   font-size: 14px;   color: rgb(112, 112, 112);   margin-left: 7px;   margin-right: 7px; } .tbml-time {   font-family: "SourceSansPro";   font-weight: lighter;   font-size: 16px;   color: rgb(112, 112, 112); }    html {    }        body {    padding: 0px;    margin: 0px;    }        div {    margin: 0px;    padding: 0px;    }     .data-icon {    height:16px;    vertical-align: middle    } 
                  #inputBox {
                    text-align: center;
                  }
                  input {
                    position: relative;
                    font-weight: normal;
                    font-style: normal;
                    font-size: 12px;
                    display: -ms-inline-flexbox;
                    display: inline-flex;
                    color: rgba(0, 0, 0, 0.87);
                    padding: 9.5px 14px;
                    width: 300px;
                    border-color: #D8D8D8;
                  }
                  input[type=text]:focus {
                    border-color: #D8D8D8;
                    background: #FAFAFA;
                    color: rgba(0, 0, 0, 0.87);
                    -webkit-box-shadow: none;
                    box-shadow: none;
                  }
            </style>
            <script type="text/javascript">
                class Token {
                    constructor(tokenInstance) {
                        this.props = tokenInstance
                    }
                    
                    render() {
                    return\`
                        <h3>Set ENS name for your token ...</h3>
                        <div id="msg"></div>
                        <div id="inputBox">
                                 <h3>Name</h3>
                                 <input id="name-txt" type="text" value='' />
                              </div>
                        <div id="status"/>\`;
                    }
                }
                
                web3.tokens.dataChanged = (oldTokens, updatedTokens, cardId) => {
                    const currentTokenInstance = updatedTokens.currentInstance;
                    document.getElementById(cardId).innerHTML = new Token(currentTokenInstance).render(); 
                };
                
                    function handleErrors(response) {
                        if (!response.ok) {
                            let errorResp = response.json();
                            throw Error(\`\${errorResp.fail}\`);
                        }
                        return response.text();
                    }

                    async function handleErrorsJSON(response) {
                        if (!response.ok) {
                            let errorResp = await response.json();
                            throw Error(\`\${errorResp.fail}\`);
                        }
                        return response.json();
                    }
  
                    var serverAddr = "https://ens.main.smartlayer.network";
                    var domainName = "ENS_DOMAIN";
                
                    document.addEventListener("DOMContentLoaded", function() {
                      window.onload = function startup() {
                          // 1. call API to fetch current name
                          fetch(\`\${serverAddr}/name/\${currentTokenInstance.chainId}/\${currentTokenInstance.contractAddress}/\${currentTokenInstance.tokenId}\`)
                              .then(handleErrorsJSON)
                              .then(function (data) {
                                  const result = data.result;
                                  if (result.length == 0) {
                                    document.getElementById('msg').innerHTML = "Name not set";
                                  } else {
                                    document.getElementById('msg').innerHTML = "Current Name: " + result
                                  }
                                  window.challenge = result
                              })
                      }

                      window.onConfirm = function onConfirm(signature) {
                        var nameText = document.getElementById('name-txt').value;
                        nameText = nameText.substring(0, 255); //limit to 255 characters
                        //form the NFT naming request
                        const registerMsg = \`Attempting to register NFT \${nameText}.\${domainName} name to \${currentTokenInstance.contractAddress} \${currentTokenInstance.tokenId} on chain \${currentTokenInstance.chainId}\`;

                        document.getElementById('status').innerHTML = 'Wait for signature...'
                        // 2. sign challenge to generate request
                        web3.personal.sign({ data: registerMsg }, function (error, value) {
                            if (error != null) {
                                document.getElementById('status').innerHTML = "Sign attempt failed";
                                console.log(\`Sign attempt failed: \${error}\`);
                            } else{
                            document.getElementById('status').innerHTML = 'Verifying name request ...'
                            // 3. register new name
                            fetch(\`\${serverAddr}/registerNFT/\${currentTokenInstance.chainId}/\${currentTokenInstance.contractAddress}/\${nameText}.\${domainName}/\${currentTokenInstance.tokenId}/\${value}\`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(""),
                            })
                            .then(handleErrorsJSON)
                                .then(function (response) {
                                    const result = response.result;
                                    if (result == "pass") {
                                        document.getElementById('status').innerHTML = 'Name registered!'
                                        window.close()
                                    } else {
                                        document.getElementById('status').innerHTML = 'Failed with: ' + response
                                    }
                                }).catch(function(err) {
                                    document.getElementById('status').innerHTML = err
                                  console.log("error: " + err);
                                });
                            }
                        });
                        window.challenge = '';
                        document.getElementById('msg').innerHTML = '';
                    }
                    });
        </script>
        
            </ts:view>
        </ts:card>"`,
  imageUrl: "https://ipfs.io/ipfs/QmNta15bDPgEtvG7NDxxL4mcfPhJ2urjaNU2vSWz2gHkxE",
  creator: "61cygni.eth"
};

export const getAgent = async (id: string) => {
  console.log(`AGENT: ${id}`);
  const agent = await kv.hgetall<Agent>(`agent:${id}`)
  let agentTxt = `agent:${id}`;
  console.log(`CANNOT: agent:${id}`);
  console.log(`AGENT_RT: ${JSON.stringify(await kv.hgetall(agentTxt))}`)
  console.log(`AGENT_RT: ${await kv.hgetall(agentTxt)}`)
  console.log(`F_AGENT ${JSON.stringify(agent)}`);
  console.log(`FETCH: ${await kv.keys("*")}`);
  return agentTS
}

export const getAgents = async () => {
  const agents = await kv.smembers("agents:list")
  const pipeline = kv.pipeline()

  for (const agentId of agents) {
    pipeline.hgetall<Agent>(`agent:${agentId}`)
  }

  const results = await pipeline.exec<Agent[]>()
  return results
}

//const tryServer = await getAgent("asst_fns5bh6XGZ8SHcmI60syHuHh");
//console.log(`test: ${tryServer}`);