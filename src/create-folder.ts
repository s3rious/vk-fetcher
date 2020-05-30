import {promises as fs} from 'fs'
import {resolve, normalize} from 'path'

const createFolder = async (folder: string) => {
  const path = normalize(resolve(process.cwd(), folder))

  try {
    await fs.mkdir(path, {recursive: true})

    return path
  } catch (error) {
    throw error
  }
}

export {createFolder}
