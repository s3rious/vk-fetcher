import {WallWallpostFull} from 'node-vk-sdk/distr/src/generated/Models'

type DocumentToDownload = {
  url: string;
  name: string;
}

function extractHashtags(text: string): string {
  const regex = /(?:^|\s)#([\dA-Z_-azЁА-яё-]+)/gm
  const matches = []
  let match

  while ((match = regex.exec(text))) {
    matches.push(match[1])
  }

  return matches.join('__')
}

const extractDocumentsFromPosts = (posts: Array<WallWallpostFull>): Array<DocumentToDownload> =>
  posts
  .map(({text, attachments}) =>
    attachments.map(attachment => (
      {...attachment, text}
    )
    ))
  .reduce((accum, attachments) =>
    [...accum, ...attachments], []
  )
  .filter(attachment =>
    attachment.type === 'doc'
  )
  .map(attachment => {
    const name = `${extractHashtags(attachment.text)}___${attachment.doc.title}`.replace(/\s/gm, '_')

    return {
      url: attachment.doc.url,
      name,
    }
  })

export {extractDocumentsFromPosts, DocumentToDownload}
