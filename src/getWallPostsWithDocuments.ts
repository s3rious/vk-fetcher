import {VKApi} from "node-vk-sdk";

const getWallPostsWithDocuments = async (api: VKApi, group_id: number) => {
  const owner_id = group_id * -1
  const { count } = await api.wallGet({ owner_id, count: 1, extended: false })

  const requestsMap: Array<{ offset: number, count: number }> = (() => {
    const map = []
    let postsCount = count
    let offset = 0

    while (postsCount > 0) {
      if (postsCount > 100) {
        map.push({
          offset,
          count: 100
        })
        offset = offset + 100
        postsCount = postsCount - 100
      }

      if (postsCount < 100) {
        map.push({
          offset,
          count: postsCount
        })
        postsCount = 0
      }
    }

    return map
  })()

  return (
    await Promise.all(requestsMap.map(({ offset, count }) =>
      api.wallGet({ owner_id, offset, count })
    ))
  )
    .map(({ items }) =>
      items
    )
    .reduce((accum, items) =>
      [...accum, ...items], []
    )
    .filter((item) =>
      !!(item.attachments && item.attachments.find((attachment) => attachment.type === 'doc'))
    )
}

export { getWallPostsWithDocuments }
