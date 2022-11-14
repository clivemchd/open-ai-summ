var express = require('express');
const fs = require('fs')
const AWS = require('aws-sdk');
var router = express.Router();
var redditData = require('../redditdata');
var { ExportToCsv } = require('export-to-csv');


const filterRemovedText = () => { 
    return redditData.data.filter(({ selftext }) => selftext !== '[removed]')
    .map(({ title, selftext}) => ({ 'prompt': `${title} ${selftext}`}))
};

const convertToCsv = () => {
    const options = { 
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        showTitle: false,
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
    };

    let filename = `redditpromptdata-${new Date().getTime()/1000}.csv`
     
    const csvExporter = new ExportToCsv(options);
    const csvData = csvExporter.generateCsv(filterRemovedText(), true);
    fs.writeFileSync(__dirname + `/../generated-csv/${filename}`, csvData)
    return { filename };
}

const saveToS3Bucket = () => {
    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    const { filename } = convertToCsv();

    return new Promise((resolve, reject) => {
        fs.readFile(__dirname + `/../generated-csv/${filename}`, (err, data) => {
            if (err) reject(err);
            const params = {
                Bucket: 'csv-generated-files-gpt3',
                Key: `redditpromptdata-${new Date().getTime()/1000}.csv`,
                Body: Buffer.from(JSON.stringify(data || { prompt : 'test' }))
            };
            s3.upload(params, function(s3Err, data) {
                fs.unlink(__dirname + `/../generated-csv/${filename}`, function (err) {
                    if (err) {
                        console.log('err ', err);
                        return
                    }
                    console.log('Temp File Delete');
                });
                if (s3Err) reject(s3Err);
                resolve({ status: `File uploaded successfully`, s3Data: data })
            });
         });
    })
}

/* create csv file. */
router.get('/create', async (req, res, next) => {
    saveToS3Bucket()
    .then((data) => {
        res.status(200).append('Content-Type', 'application/json; charset=UTF-8').send(data);
    })
    .catch((err) => {
        res.status(400).append('Content-Type', 'application/json; charset=UTF-8').send({ message : err });
    })
});

module.exports = router;