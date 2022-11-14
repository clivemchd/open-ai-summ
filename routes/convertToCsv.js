var express = require('express');
const fs = require('fs')
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
     
    const csvExporter = new ExportToCsv(options);
    const csvData = csvExporter.generateCsv(filterRemovedText(), true);
    fs.writeFileSync(__dirname + `/../generated-csv/redditpromptdata+${new Date().getTime()/1000}.csv`, csvData)
}

/* create csv listing. */
router.get('/createcsv', async (req, res, next) => {
    convertToCsv();
    res.status(200).append('Content-Type', 'application/json; charset=UTF-8').send({ status: filterRemovedText() });
});

module.exports = router;