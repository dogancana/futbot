interface Auth {
  ipPort: string
  lastOnlineTime: Date
  phishingToken: string
  protocol: string
  serverTime: Date
  sid: string
}

interface Session {
  auth?: Auth
  lastStamp?: number
}

const apiSession: Session = {}

export class SessionInjector {
  static get auth (): Auth {
    return apiSession.auth
  }

  static set auth (auth: Auth) {
    apiSession.auth = auth;
  }

  static get lastStamp (): number {
    return apiSession.lastStamp
  }

  static set lastStamp (lastStamp: number) {
    apiSession.lastStamp = lastStamp;
  }
}