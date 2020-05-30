import {cpus} from 'os'
import {WallWallpostFull} from 'node-vk-sdk/distr/src/generated/Models'

import {getVkApiInstance} from './get-vk-api-instance'
import {resolveScreenName} from './resolve-screen-name'
import {getWallPostsWithDocuments} from './get-wall-posts-with-documents'
import {extractDocumentsFromPosts, DocumentToDownload} from './extract-documents-from-posts'
import {createFolder} from './create-folder'
import {downloadDocuments} from './download-documents'

type flagsTypes = {
  token: string;
  group: string;
  threads?: number;
}

const log = (message: string): void => {
  console.log(message)
}

const error = (message: string | Error, {exit = 1}: {exit?: number}) => {
  console.error(message)
  process.exit(exit)
}

class VkFetcher {
  flags: flagsTypes

  constructor(flags: flagsTypes) {
    if (!flags.threads) {
      flags.threads = cpus().length
    }

    this.flags = flags
  }

  async run() {
    const threads = this.flags.threads || 1
    const folder = `./download/${this.flags.group}`
    let path
    let group_id: number
    let posts: Array<WallWallpostFull>
    let documents: Array<DocumentToDownload>

    log('Creating VKApi instance...')
    const api = getVkApiInstance(this.flags.token)
    log('... created!\n')

    log(`Resolving group screen name for "${this.flags.group}"...`)
    try {
      group_id = await resolveScreenName(api, this.flags.group)
    } catch (error_) {
      error(error_, {exit: 2})
    }
    log(`... resolved: ${group_id}!\n`)

    log('Getting list of wall posts with documents...')
    try {
      posts = await getWallPostsWithDocuments(api, group_id)
    } catch (error_) {
      error(error_, {exit: 2})
    }
    log(`... got it: ${posts.length}!\n`)

    log('Extracting documents from wall posts...')
    try {
      documents = extractDocumentsFromPosts(posts)
    } catch (error_) {
      error(error_, {exit: 2})
    }
    log(`... extracted it: ${documents.length}!\n`)

    log(`Creating a folder "${folder}" where filed will be downloaded to...`)
    try {
      path = await createFolder(folder)
    } catch (error_) {
      error(error_, {exit: 2})
    }
    log('... done!\n')

    log('Downloading documents...')
    try {
      await downloadDocuments(documents, path, log, threads)
    } catch (error_) {
      error(error_, {exit: 2})
    }
    log('... done!')
  }
}

(async () => {
  const argv = process.argv
  const tokenIndex = argv.indexOf('--token')
  const groupIndex = argv.indexOf('--group')
  const threadsIndex = argv.indexOf('--threads')
  const flags: Partial<flagsTypes> = {}

  if (tokenIndex > -1) {
    flags.token = argv[tokenIndex + 1]
  }

  if (groupIndex > -1) {
    flags.group = argv[groupIndex + 1]
  }

  if (threadsIndex > -1) {
    flags.threads = Number.parseInt(argv[threadsIndex + 1], 10)
  }

  if (typeof flags.token === 'undefined') {
    error(new Error('No token specified'), {exit: 2})
  }

  if (typeof flags.group === 'undefined') {
    error(new Error('No group specified'), {exit: 2})
  }

  const vkFetcher = new VkFetcher(flags as flagsTypes)

  await vkFetcher.run()
})()
