import express from 'express'
import cors from 'cors'
import {getProvidersList, prepareProvidersInfo} from './finder.js'


const app = express()
app.use(cors({
    origin: '*'
}))

const port = 3000

app.get('/providers/:ipfsCid', async (req, res) => {
    try {
        let providers = await getProvidersList(req.params.ipfsCid)
        res.send({
            providers: providers
        })
    } catch (e) {
        console.log(e)
        res.send('error')
    }
})

prepareProvidersInfo().then(() => {
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })

})

