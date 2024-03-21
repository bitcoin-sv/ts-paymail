import { HD } from '@bsv/sdk'

class MockUser {
  private readonly alias: string
  private readonly avatarUrl: string
  private readonly extendedPrivateKey: string

  constructor (alias, avatartUrl, extendedPrivateKey) {
    this.alias = alias
    this.avatarUrl = avatartUrl
    this.extendedPrivateKey = extendedPrivateKey
  }

  getAlias () {
    return this.alias
  }

  getAvatarUrl () {
    return this.avatarUrl
  }

  getExtendedPrivateKey () {
    return new HD().fromString(this.extendedPrivateKey)
  }
}

const mockUser1 = new MockUser(
  'satoshi',
  'https://cdns-images.dzcdn.net/images/artist/0cd4444701460a1ccf94d150e37476d9/500x500.jpg',
  'xprv9s21ZrQH143K3JXfv6ia4roUARejG3VEEjbhNS1BbeHMFF2V1zBd949FrxUJZat3FSFLEA9wZxjUV2NdbbvD9uCiibdRfpaBVGysQaZxduX')

export { mockUser1 }

export default MockUser
