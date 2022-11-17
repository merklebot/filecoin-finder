import {LotusRPC} from '@filecoin-shipyard/lotus-client-rpc'
import {mainnet} from '@filecoin-shipyard/lotus-client-schema'
import {NodejsProvider} from '@filecoin-shipyard/lotus-client-provider-nodejs'

const endpointUrl = 'wss://api.chain.love/rpc/v0'
const provider = new NodejsProvider(endpointUrl)
let client

export async function prepareProvidersInfo() {
    client = new LotusRPC(provider, {schema: mainnet.fullNode})
    try {
        await getMinersList()
    } finally {
        client.destroy()
    }
}

async function getMinerPeerId(minerId) {
    const minerInfo = await client.stateMinerInfo(minerId, [])
    console.log('PeerID=', minerInfo['PeerId'])
    return minerInfo['PeerId']
}

const WEB3_STORAGE_TOKEN = process.env.WEB3_STORAGE_TOKEN
const providersPeers = {}

const getMinersList = async () => {
    let response = await fetch("https://api.web3.storage/user/uploads?size=1000", {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${WEB3_STORAGE_TOKEN}`
        }

    })
    let uploads = await response.json()
    let providers = new Set()
    uploads.forEach(upload => {
        upload.deals.forEach(deal => {
            const minerId = deal['storageProvider']
            providers.add(minerId)
        })
    })
    for (const minerId of providers) {
        const peerId = await getMinerPeerId(minerId)
        providersPeers[peerId] = minerId
    }
    console.log(providers)
    console.log(providersPeers)
}

const getProvidersViaCidContact = async (ipfsCid) => {
    let providers = []
    let response = await fetch("https://cid.contact/cid/" + ipfsCid)
    let uploadInfo = await response.json()
    let providerResults = uploadInfo.MultihashResults[0].ProviderResults
    for (let providerResult of providerResults) {
        let providerId = providerResult.Provider.ID
        if (providerId.startsWith('12')) {
            if (providersPeers[providerId]) {
                providers.push(providersPeers[providerId])
            }
        }
    }
    return providers
}

const getProvidersViaWeb3Storage = async (ipfsCid) => {
    let response = await fetch("https://api.web3.storage/status/" + ipfsCid)
    let uploadInfo = await response.json()
    let providers = []
    let dealsList = uploadInfo['deals']
    dealsList.forEach(deal => {
        providers.push(deal['storageProvider'])
    })
    return providers
}

export const getProvidersList = async (ipfsCid) => {
    let providers = await getProvidersViaCidContact(ipfsCid)
    console.log(`Providers from cid.contact ${providers}`)
    if (providers.length === 0) {
        console.log("Getting providers list from web3.storage")
        providers = await getProvidersViaWeb3Storage(ipfsCid)
    }
    return providers
}