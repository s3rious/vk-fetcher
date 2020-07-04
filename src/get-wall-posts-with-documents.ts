import {VKApi} from 'node-vk-sdk'
import {WallWallpostFull} from "node-vk-sdk/distr/src/generated/Models";

const getWallPostsWithDocuments = async (api: VKApi, group_id: number): Promise<Array<WallWallpostFull>> => {
  const owner_id = group_id * -1
  const {count} = await api.wallGet({owner_id, count: 1, extended: false})

  const requestsMap: Array<{ offset: number; count: number }> = (() => {
    const map = []
    let postsCount = count
    let offset = 0

    while (postsCount > 0) {
      if (postsCount > 100) {
        map.push({
          offset,
          count: 100,
        })
        offset += 100
        postsCount -= 100
      }

      if (postsCount < 100) {
        map.push({
          offset,
          count: postsCount,
        })
        postsCount = 0
      }
    }

    return map
  })()

  const fetchAll = async () => {
    let allData: WallWallpostFull[] = []

    await requestsMap.reduce((acc, { offset, count }, index) =>
      acc
        .then(() => {
          console.log(`Fetching ${index} out of ${requestsMap.length} posts chunks...`)

          return api.wallGet({ owner_id, offset, count })
        })
        .then((data) => {
          console.log('... fetched!')

          allData = [...allData, ...data.items]

          return
        }),
      Promise.resolve()
    )

    return allData
  }

  const data = await fetchAll()

  return data.filter(item =>
    Boolean(item.attachments && item.attachments.find(attachment => attachment.type === 'doc'))
  )
}

export {getWallPostsWithDocuments}
