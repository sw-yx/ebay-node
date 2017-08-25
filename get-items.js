var request = require('request-promise');

// eBay Developer ID
const EBAY_APP_ID = 'AbramFla-0959-4008-950d-e8abb475a969';

// eBay base API request URL
const baseApiUrl = "http://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findCompletedItems" +
    "&SERVICE-VERSION=1.7.0" +
    "&SECURITY-APPNAME=" + EBAY_APP_ID +
    "&RESPONSE-DATA-FORMAT=JSON" +
    "&REST-PAYLOAD" +
    "&keywords="

var keywords = 'boba fett star wars action figure';

// url-ify the whitespaces in the keyword string
keywords = keywords.replace(/ /g, '%20');

var url = baseApiUrl + keywords;

// currently, this is pretty useless
// will need to use the 'then' to return to a front end
buildObjectArray()
    .then(() => {
      console.log('API call completed succesfully!')
    })
    .catch(err => {
      console.log(`API call failed with error: ${err}`)
    });

console.log('Request to the eBay API endpoint for "findCompletedItems" in progress....');

// < FUNCTIONS >

// this agg function takes the list of endpoints
// and iterates through them calling the
// request operation ( which returns a promise )
async function buildObjectArray(){
  try {
    return await getAllResults().then(data=>{
      let jsonData = [];
      for (let i of data){
        jsonData.push(JSON.parse(i).findCompletedItemsResponse[0]['searchResult'][0].item);
      }
      jsonData = jsonData.reduce(function(a,b){
        return a.concat(b);
      })
      console.log(`Total unfiltered results: ${jsonData.length}`);
      return jsonData;
    })
        .catch(err=>{console.log(`Promise error: ${err}`)});
  }
  catch (err){
    console.log(`Error: ${err}`);
  }
}

async function getAllResults(){
  try{
    let urls = getEndpoints().then();
    let data = [];
    let endpoints = await urls; // blocking
    for (let ep of endpoints){
      console.log(`Calling endpoint: ${ep}`);
      data.push(await request(ep).then(response=>{return response}));
    }
    return data;
  }
  catch (err){
    console.log(err);
  }
}

// this is an aggregate function that getsPages and builds the urls (urlBuilder)
// and then returns the list of endpoints as an array
async function getEndpoints(){
  try {
    let pages = getPages(url);
    return await pages.then(count=>{
      let eta;
      if ((count*2)/60 < 1){
        eta = `${Math.round(count*2)} seconds`
      }
      else {
        eta = `${Math.round((count*2)/60)} minutes`
      }
      console.log(`Total pages: ${count}\nETA: ${eta}`);
      return urlBuilder(count);
    });
    
  }
  catch (err){
    console.log(err);
  }
}

// this gets and returns the number of pages
async function getPages(url){
  try {
      let pageCount = request(url).then(result=>{
        return JSON.parse(result).findCompletedItemsResponse[0].paginationOutput[0].totalPages[0]
    })
    return await pageCount;
  }
  catch (err){
    console.log(err);
  }
}

// this takes the number of pages and
// builds and returns an endpoint list
// as an array
function urlBuilder(pages){
  let urls = [];
  if(pages > 100) {
    for (let i = 0; i < 100; i++) {
      urls.push(url + `&paginationInput.pageNumber=${i + 1}`);
    }
  }
  else {
    for(let i=0; i < pages; i++){
      urls.push(url + `&paginationInput.pageNumber=${i + 1}`);
    }
  }
  return urls;
}