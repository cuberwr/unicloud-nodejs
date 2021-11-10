const fetch = require('node-fetch')
const sign = require('./sign')
const fs = require('fs')
const FormData = require('form-data')
const path = require('path')


let spaceInfo = {
    provider: "aliyun",
    spaceName: "",
    spaceId: "",
    clientSecret: "",
    endpoint: "https://api.bspapp.com"
}

async function getAccessToken() {
    return new Promise(async resolve => {
        let data = {
            "method": "serverless.auth.user.anonymousAuthorize",
            "params": "{}",
            "spaceId": spaceInfo.spaceId,
            "timestamp": Date.now()
        }
        let res = await fetch("https://api.bspapp.com/client", {
            "headers": {
                "x-serverless-sign": sign(data, spaceInfo.clientSecret)
            },
            "body": `{\"method\":\"serverless.auth.user.anonymousAuthorize\",\"params\":\"{}\",\"spaceId\":\"${spaceInfo.spaceId}\",\"timestamp\":${data.timestamp}}`,
            "method": "POST"
        });
        res = await res.json()
        console.log(res)
        resolve(res)
    })
}

async function callFunction(name, dat) {
    let data = {
        "method": "serverless.function.runtime.invoke",
        "params": `{\"functionTarget\":\"${name}\",\"functionArgs\":${JSON.stringify(dat)}}`,
        "spaceId": spaceInfo.spaceId,
        "timestamp": Date.now(),
        "token": ''
    }
    data.token = await getAccessToken()
    data.token = data.token.data.accessToken
    let res = await fetch("https://api.bspapp.com/client", {
        "headers": {
            "x-basement-token": data.token,
            "x-serverless-sign": sign(data, spaceInfo.clientSecret)
        },
        "body": JSON.stringify(data),
        "method": "POST"
    });
    res = await res.json()
    console.log(res.data)
};


async function uploadFile(file) {
    let data = {
        "method": "serverless.file.resource.generateProximalSign",
        "params": `{\"env\":\"public\",\"filename\":\"${path.basename(file)}\"}`,
        "spaceId": spaceInfo.spaceId,
        "timestamp": Date.now(),
        "token": ''
    }
    data.token = await getAccessToken()
    data.token = data.token.data.accessToken
    let res = await fetch("https://api.bspapp.com/client", {
        "headers": {
            "x-basement-token": data.token,
            "x-serverless-sign": sign(data, spaceInfo.clientSecret)
        },
        "body": JSON.stringify(data),
        "method": "POST"
    });
    res = await res.json()
    console.log(res)
    
    let formdata = new FormData()
    formdata.append("file", fs.createReadStream(file))
    formdata.append("Cache-Control","max-age=2592000")
    formdata.append("Content-Disposition","attachment")
    formdata.append("OSSAccessKeyId",res.data.accessKeyId)
    formdata.append("Signature", res.data.signature)
    formdata.append("host", res.data.host)
    formdata.append("id", res.data.id)
    formdata.append("key", res.data.ossPath)
    formdata.append("policy", res.data.policy)
    formdata.append("success_action_status", 200)

    //console.log(formdata)
    let ossHeaders= {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Content-Length": 602325,
        "Connection": "keep-alive",
        "Accept-Language": "zh-CN",
        "Content-Type": '',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "X-OSS-server-side-encrpytion": "AES256"
    }
    ossHeaders['content-type']=formdata.getHeaders()
    ossHeaders['content-type']=ossHeaders['content-type']['content-type']
    let ggg= await fetch("https://"+res.data.host, {
    "headers": ossHeaders,
    "body": formdata,
    "method": "PUT"
    })
    console.log({
        "headers": ossHeaders,
        "body": formdata,
        "method": "POST"
        })
    console.log(ggg)
    
    let data0 = {
        "method": "serverless.file.resource.report",
        "params": `{\"id\":\"${res.data.id}\"}`,
        "spaceId": spaceInfo.spaceId,
        "timestamp": Date.now(),
        "token": ''
    }
    console.log(data0)
    
    data0.token = data.token
    let res0 = await fetch("https://api.bspapp.com/client", {
        "headers": {
            "x-basement-token": data0.token,
            "x-serverless-sign": sign(data0, spaceInfo.clientSecret)
        },
        "body": JSON.stringify(data0),
        "method": "POST"
    });
    res0 = await res0.json()
    console.log(res0)
}

module.exports={callFunction,uploadFile}