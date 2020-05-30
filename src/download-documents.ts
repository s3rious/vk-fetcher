import * as download from 'download'
import {DocumentToDownload} from './extract-documents-from-posts'

const chunk = <T>(array: Array<T>, size: number): Array<Array<T>> => {
  const chunked_array = []
  let index = 0

  while (index < array.length) {
    chunked_array.push(array.slice(index, size + index))
    index += size
  }

  return chunked_array
}

const downloadChunk = (chunk: Array<DocumentToDownload>, path: string) => Promise.all(
  chunk.map(document => download(document.url, path, {filename: document.name}))
)

const downloadDocuments = async (
  documents: Array<DocumentToDownload>,
  path: string,
  log: (message?: string) => void,
  threads = 1
) => {
  const total = documents.length
  const chunks = chunk(documents, threads)

  return chunks.reduce((promise, chunk, index): any =>
    promise.then(() => {
      const min = index * threads
      let max = (index + 1) * threads
      max = max > total ? total : max

      log(`... ${min}-${max} out of ${total}...`)

      return downloadChunk(chunk, path)
    }), Promise.resolve()
  )
}

export {downloadDocuments}
