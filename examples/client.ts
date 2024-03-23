import PaymailClient from '../src/paymailClient/paymailClient.js'

const client = new PaymailClient();

(async () => {
  const publicProfile = await client.getPublicProfile('satoshi@localhost')
  console.log(publicProfile)
})()
