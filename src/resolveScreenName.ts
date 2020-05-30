import {VKApi} from "node-vk-sdk";

const resolveScreenName = async (api: VKApi, screen_name: string) => {
  const response = await api.utilsResolveScreenName({ screen_name })

  if (!response?.object_id) {
    throw new Error(`Screen name is not resolved for "${screen_name}" perhaps group was deleted or something️ 🤷‍♂️`)
  }

  if (response.type !== 'group') {
    throw new Error(`"${screen_name}" is not a group!`)
  }

  return response.object_id
}

export { resolveScreenName }
