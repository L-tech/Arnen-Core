import { Web3Storage } from 'web3.storage'

function getAccessToken() {
  return process.env.WEB3STORAGE_TOKEN
}

function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() })
}

function getFiles() {
    const fileInput = document.querySelector('input[type="file"]')
    return fileInput.files
}
async function storeFiles(files) {
    const client = makeStorageClient()
    const cid = await client.put(files)
    console.log('stored files with cid:', cid)
    return cid
}