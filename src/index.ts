import {Command, flags} from '@oclif/command'
import {VKApi} from "node-vk-sdk";
import {getVkApiInstance} from "./getVkApiInstance";
import {resolveScreenName} from "./resolveScreenName";

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
    let group_id: number


    this.log('Creating VKApi instance...')
    api = getVkApiInstance(flags.token)
    this.log('... created!')

    this.log(`Resolving group screen name for "${flags.group}"...`)
    try {
      group_id = await resolveScreenName(api, flags.group)
    }
    catch (error) {
      this.error(error, {exit: 2})
    }
    this.log(`... resolved: ${group_id}!`)
  }
}

export = VkFetcher
