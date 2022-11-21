import express from 'express'
import cors from 'cors'
import {getProvidersList, prepareProvidersInfo} from './finder.js'


const app = express()
app.use(cors({
    origin: '*'
}))

const port = 3000

app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

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

