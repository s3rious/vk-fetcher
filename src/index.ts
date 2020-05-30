import {Command, flags} from '@oclif/command'

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
      description: 'vk group. e.g.: ptashe4ka07'
    }),
  }

  async run() {
    const {flags} = this.parse(VkFetcher)

    if (!flags.token) {
      this.error('No token specified', {exit: 2})
    }

    if (!flags.group) {
      this.error('No group specified', {exit: 2})
    }

    this.log(JSON.stringify(flags, null, 2))
  }
}

export = VkFetcher
