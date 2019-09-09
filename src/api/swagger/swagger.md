# BetProtocol API
## Version: 0.3.6

### /admins/register

#### POST
##### Summary:

Register User Data

##### Description:

Search for matching accounts in the system.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| admin | body | Admin object to submit to the network | Yes | [AdminRegisterRequest](#adminregisterrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /admins/login

#### POST
##### Summary:

Login User

##### Description:

Login Admin Data

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| admin | body | Admin object to submit to the network | Yes | [AdminLoginRequest](#adminloginrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /users/register

#### POST
##### Summary:

Register User Data

##### Description:

Search for matching accounts in the system.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| user | body | User object to submit to the network | Yes | [UserRegisterRequest](#userregisterrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /users/login

#### POST
##### Summary:

Login User

##### Description:

Login User Data

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| user | body | User object to submit to the network | Yes | [UserLoginRequest](#userloginrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /users/summary

#### POST
##### Summary:

Get Summary Data for User

##### Description:

Get Summary Data for User

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| user | body | User Information | Yes | [UserSummaryRequest](#usersummaryrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /users/updateWallet

#### POST
##### Summary:

Update Wallet Amount for the User

##### Description:

Update Wallet Amount for the User

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| user | body | User Information | Yes | [UpdateUserWalletRequest](#updateuserwalletrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /users/finalizeWithdraw

#### POST
##### Summary:

Request for User Finalize Withdraw

##### Description:

Request Finalize Withdraw

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| user | body | User Information | Yes | [UserFinalizeWithdrawRequest](#userfinalizewithdrawrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /users/requestWithdraw

#### POST
##### Summary:

Request for User Withdraw

##### Description:

Update Wallet Amount for the User

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| user | body | User Information | Yes | [UserWithdrawRequest](#userwithdrawrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /app/create

#### POST
##### Summary:

Create a App

##### Description:

Create a App for the user defined

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| app | body | App Information | Yes | [AppCreationRequest](#appcreationrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /app/summary

#### POST
##### Summary:

Get Summary Data for App

##### Description:

Get Summary Data for App

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| app | body | App Information | Yes | [AppSummaryRequest](#appsummaryrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /app/get

#### POST
##### Summary:

Get Data for App

##### Description:

Get Summary Data for App

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| app | body | App Information | Yes | [AppGetRequest](#appgetrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /app/transactions

#### POST
##### Summary:

Get Summary Data for App

##### Description:

Get Summary Data for App

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| app | body | App Information | Yes | [AppTransactionsRequest](#apptransactionsrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /app/finalizeWithdraw

#### POST
##### Summary:

Request for App Finalize Withdraw

##### Description:

Request Finalize Withdraw

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| app | body | App Information | Yes | [AppFinalizeWithdrawRequest](#appfinalizewithdrawrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /app/requestWithdraw

#### POST
##### Summary:

Request for User Withdraw

##### Description:

Update Wallet Amount for the User

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| app | body | App Information | Yes | [AppRequestWithdrawRequest](#apprequestwithdrawrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /app/services/add

#### POST
##### Summary:

Add Services to Company

##### Description:

Add Services to Company

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| app | body | App Information | Yes | [AppServicesRequest](#appservicesrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /app/paybearsecretkey/add

#### POST
##### Summary:

Add Services to Company

##### Description:

Add Services to Company

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| app | body | App Information | Yes | [AppPaybearAPIKeyRequest](#apppaybearapikeyrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /app/updateWallet

#### POST
##### Summary:

Update Wallet Amount for the App

##### Description:

Update Wallet Amount for the App

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| app | body | App Information | Yes | [UpdateAppWalletRequest](#updateappwalletrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /app/api/createToken

#### POST
##### Summary:

Get Summary Data for App

##### Description:

Get Summary Data for App

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| app | body | App Information | Yes | [AppTokenAPIRequest](#apptokenapirequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /app/addBlockchainInformation

#### POST
##### Summary:

Add Blockchain Information into the Setup

##### Description:

Add Blockchain Information into the Setup

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| app | body | App Information | Yes | [AppBlockchainInformationRequest](#appblockchaininformationrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /app/games/add

#### POST
##### Summary:

Create a Game in App Name

##### Description:

Create a Game for the App defined

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| game | body | Game Information | Yes | [GameCreationRequest](#gamecreationrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /app/games/getAll

#### POST
##### Summary:

Get all Games for the App defined

##### Description:

Get all Games for the App defined

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| game | body | Game Information | Yes | [GetGamesFromAppRequest](#getgamesfromapprequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /app/games/bet/place

#### POST
##### Summary:

Place a Bet

##### Description:

Place a Bet for User Selected

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| bet | body | Bet Information | Yes | [PlaceBetRequest](#placebetrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /app/games/get

#### POST
##### Summary:

Get a game

##### Description:

Get a Game Data

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| bet | body | Game Information | Yes | [GameGetRequest](#gamegetrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /app/deposit/generateReference

#### POST
##### Summary:

Create a Deposit Reference

##### Description:

Create a Deposit Reference for given CryptoCurrency

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| deposit | body | Deposit Reference Information | Yes | [GenerateReferenceRequestApp](#generatereferencerequestapp) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /users/deposit/generateReference

#### POST
##### Summary:

Create a Deposit Reference

##### Description:

Create a Deposit Reference for given CryptoCurrency

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| deposit | body | Deposit Reference Information | Yes | [GenerateReferenceRequestUsers](#generatereferencerequestusers) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /deposit/{id}/confirm

#### POST
##### Summary:

Confirm Deposit Creatione

##### Description:

Confirm Deposit Creation for given Crypto / PayBear

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path | Deposit Id Paybear Callback | Yes | string |
| deposit | body | Deposit Reference Information | Yes | object |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /deposit/{id}/info

#### POST
##### Summary:

Get info Deposit

##### Description:

Info Deposit Creation for given Crypto / PayBear

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path | Deposit Id Paybear Callback | Yes | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Success | [GeneralResponse](#generalresponse) |
| default | Error | [ErrorResponse](#errorresponse) |

### /swagger

### Models


#### AdminRegisterRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| username | string (username) | Unique identifier of the user, besides the ID
 | Yes |
| name | string | User Real Name
 | Yes |
| email | string | User Email
 | Yes |
| password | string | Password Hashed
 | Yes |

#### UserRegisterRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| username | string (username) | Unique identifier of the user, besides the ID
 | Yes |
| name | string (name) | User Real Name
 | Yes |
| email | string (email) | User Email
 | Yes |
| app | string | App Id
 | Yes |
| address | string | User Address
 | Yes |

#### AdminLoginRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| username | string (username) | Unique identifier of the user, besides the ID
 | Yes |
| password | password | User Password Encrypted
 | Yes |

#### UserLoginRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| username | string (username) | Unique identifier of the user, besides the ID
 | Yes |
| password | password | User Password Encrypted
 | Yes |

#### UserSummaryRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| type | string (name) | Type of Summary Data
 | Yes |
| user | string (name) | User ID
 | Yes |

#### AppGetRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| app | string (name) | App id
 | Yes |

#### AppCreationRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| name | string (name) | App Name
 | Yes |
| address | string | App Address Management 
 | Yes |
| description | string (description) | App Description
 | Yes |
| marketType | integer | Market Mapping Number
 | Yes |
| metadataJSON | string | Metadata JSON Object
 | Yes |
| admin_id | string | Admin Id
 | Yes |

#### GameGetRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | string (name) | Game Id
 | Yes |

#### AppTransactionsRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| app | string (name) | App ID
 | Yes |
| filters | [ object ] |  | Yes |

#### AppRequestWithdrawRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| newBalance | number | New User Balance for User
 | Yes |
| tokenAmount | number | Amount of Tokens to be Withdraw
 | Yes |
| nonce | number | Use Nonce
 | Yes |
| app | string (name) | App ID
 | Yes |
| address | string (name) | User Address
 | Yes |
| signature | object | User Signature
 | Yes |

#### AppFinalizeWithdrawRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| tokenAmount | number | New User Balance for User
 | Yes |
| app | string (name) | App ID
 | Yes |
| address | string (name) | User Address
 | Yes |
| signature | object | User Signature 
 | Yes |
| transactionHash | string (name) | Transaction Hash
 | Yes |

#### UpdateAppWalletRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| amount | number | Amount added or taken from Wallet
 | Yes |
| app | string (name) | App ID
 | Yes |
| transactionHash | string (name) | Transaction Hash
 | Yes |

#### UserWithdrawRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| newBalance | number | New User Balance for User
 | Yes |
| tokenAmount | number | Amount of Tokens to be Withdraw
 | Yes |
| nonce | number | Use Nonce
 | Yes |
| app | string (name) | App ID
 | Yes |
| user | string (name) | User ID
 | Yes |
| address | string (name) | User Address
 | Yes |
| signature | object | User Signature 
 | Yes |

#### UserFinalizeWithdrawRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| tokenAmount | number | New User Balance for User
 | Yes |
| app | string (name) | App ID
 | Yes |
| user | string (name) | User ID
 | Yes |
| address | string (name) | User Address
 | Yes |
| signature | object | User Signature 
 | Yes |
| transactionHash | string (name) | Transaction Hash
 | Yes |

#### UpdateUserWalletRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| amount | number | Amount added or taken from Wallet
 | Yes |
| user | string (name) | User ID
 | Yes |
| app | string (name) | App ID
 | Yes |
| transactionHash | string (name) | Transaction Hash
 | Yes |

#### AppSummaryRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| type | string (name) | App Name
 | Yes |
| app | string (name) | App ID
 | Yes |

#### AppPaybearAPIKeyRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| app | string (name) | App ID
 | Yes |
| paybearApiSecretKey | string (name) | App ID
 | Yes |

#### AppServicesRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| app | string (name) | App ID
 | Yes |
| services | [ integer ] | Services ID
 | Yes |

#### AppBlockchainInformationRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| app | string (name) | App ID
 | Yes |
| currencyTicker | string | Currency Ticker for the Address
 | No |
| platformAddress | string | Blockchain Address for the Platform 
 | No |
| platformTokenAddress | string | Token Address for the Platform
 | No |
| platformBlockchain | string | Blockchain reduce name
 | No |
| decimals | number | Blockchain Contract Decimal Reading 
 | No |

#### AppTokenAPIRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| app | string (name) | App ID
 | Yes |

#### GameCreationRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| name | string | Game Name
 | Yes |
| app | string | App Id
 | Yes |
| edge | integer |  | Yes |
| description | string (name) | App I
 | Yes |
| betSystem | number (name) | App ID
 | Yes |
| resultSpace | object | Result Space
 | Yes |

#### GetGamesFromAppRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| app | string | App Id
 | Yes |

#### PlaceBetRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| user | string (string) | User Id
 | Yes |
| app | string (string) | App Id
 | Yes |
| game | string (string) | Game Id
 | Yes |
| nonce | number | Nonce
 | Yes |
| result | [ object ] |  | Yes |
| address | string (string) | Bet Placer Address
 | Yes |

#### GenerateReferenceRequestUsers

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| user_external_id | string (name) | User External _id
 | No |
| currency | string (name) | Currency Small Identificator ["btc", "eth", etc..]
 | Yes |
| username | string (name) | Username of Email of the User
 | Yes |
| full_name | string (name) | Full Name of the User
 | No |
| name | string (name) | First Name of the User
 | No |
| nationality | string (name) | UNICODE for Nationality like PT for Portugal
 | No |
| age | number (number) | User Age
 | No |
| email | string (name) | User Email
 | Yes |
| app_id | string (name) | Company id for API Use
 | Yes |

#### GenerateReferenceRequestApp

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| currency | string (name) | Currency Small Identificator ["btc", "eth", etc..]
 | Yes |
| entity | string (name) | Company id for API Use
 | Yes |

#### GeneralResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| data | object (data) | Unique identifier of the user, besides the ID
 | Yes |
| meta | object (meta) | User Real Name
 | Yes |

#### ErrorResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| message | string |  | Yes |