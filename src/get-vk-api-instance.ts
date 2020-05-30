import {ConsoleLogger, VKApi} from 'node-vk-sdk'

const getVkApiInstance = (token: string) => new VKApi({
  token,
  lang: 'en',
  logger: new ConsoleLogger(),
})

export {getVkApiInstance}
