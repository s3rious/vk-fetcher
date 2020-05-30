import {cpus} from 'os'
import {Command, flags} from '@oclif/command'
import {VKApi} from "node-vk-sdk"
import {WallWallpostFull} from "node-vk-sdk/distr/src/generated/Models"

import {getVkApiInstance} from "./getVkApiInstance"
import {resolveScreenName} from "./resolveScreenName"
import {getWallPostsWithDocuments} from "./getWallPostsWithDocuments"
import {extractDocumentsFromPosts, DocumentToDownload} from "./extractDocumentsFromPosts"

class VkFetcher extends Command {
  static description = 'Fetches and saves to disk all of the vk group documents'

  static flags = {
    help: flags.help({
      char: 'h'
    }),
    // flag with a value (-t, --token=VALUE)
    token: flags.string({
      char: 't',
      description: 'vk api token. Get it here: https://oauth.vk.com/authorize?client_id=3955295&scope=docs,wall,groups&response_type=token'
    }),
    // flag with a value (-g, --group=VALUE)
    group: flags.string({
      char: 'g',
      description: 'vk group. e.g.: lavkasnov_ls'
    }),
    // flag with a value (-g, --group=VALUE)
    threads: flags.string({
      char: 't',
      description: 'the number of streams with which data will be downloaded from the network, defaults to number of cpu threads',
      default: String(cpus().length)
    })
  }

  async run() {
    const {flags} = this.parse(VkFetcher)

    if (!flags.token) {
      this.error(new Error('No token specified'), {exit: 2})
    }

    if (!flags.group) {
      this.error(new Error('No group specified'), {exit: 2})
    }

    let api: VKApi
    let threads = parseInt(flags.threads)
    let group_id: number
    let posts: Array<WallWallpostFull>
    let documents: Array<DocumentToDownload>

    this.log('Creating VKApi instance...')
    api = getVkApiInstance(flags.token)
    this.log('... created!\n')

    this.log(`Resolving group screen name for "${flags.group}"...`)
    try {
      group_id = await resolveScreenName(api, flags.group)
    }
    catch (error) {
      this.error(error, {exit: 2})
    }
    this.log(`... resolved: ${group_id}!\n`)

    this.log('Getting list of wall posts with documents...')
    try {
      posts = await getWallPostsWithDocuments(api, group_id)
    }
    catch (error) {
      this.error(error, {exit: 2})
    }
    this.log(`... got it: ${posts.length}!\n`)

    this.log('Extracting documents from wall posts...')
    try {
      documents = extractDocumentsFromPosts(posts)
    }
    catch (error) {
      this.error(error, {exit: 2})
    }
    this.log(`... extracted it: ${documents.length}!\n`)
  }
}

export = VkFetcher
