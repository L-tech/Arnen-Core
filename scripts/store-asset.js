import { NFTStorage, File } from "nft.storage";
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config()

const API_KEY = process.env.NFT_STORAGE_API_KEY
const NFT_Counter = 1;
async function storeAsset() {
   const client = new NFTStorage({ token: API_KEY })
   const metadata = await client.store({
       name: "Arnen NFT #", NFT_Counter,
       description: 'A Special Time Based NFT to gain access to the Arnen Platform',
       "attributes": [
            {"trait_type": "Mode", "value": "Time Based"},
            {"trait_type": "Status", "value": "Active"},
            {"trait_type": "Validity", "value": "5"},
        ],
       image: new File(
           [await fs.promises.readFile('assets/MyExampleNFT.png')],
           'MyExampleNFT.png',
           { type: 'image/png' }
       ),
   })
   console.log("Metadata stored on Filecoin and IPFS with URL:", metadata.url)
}
storeAsset()
   .then(() => process.exit(0))
   .catch((error) => {
       console.error(error);
       process.exit(1);
   });