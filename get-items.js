var request = require('request-promise');

// eBay Developer ID
const EBAY_APP_ID = 'Your EBAY APP ID'; // <- replace with your own developer ID

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
const buildObjectArray = async () => {
  try {
    const data = await getAllResults()
    let jsonData = data.map(i => JSON.parse(i).findCompletedItemsResponse[0]['searchResult'][0].item)
                      .reduce((a,b) => a.concat(b))
    console.log(`Total unfiltered results: ${jsonData.length}`);
    return jsonData
  } catch (err) {
    console.log(`Error: ${err}`);
  }
}

const getAllResults = async () => {
  try {
    let endpoints = await getEndpoints(); // blocking
    const promiseArray = endpoints.map(request)
    return await Promise.all(promiseArray)
  } catch (err){
    console.log(err);
  }
}

// this is an aggregate function that getsPages and builds the urls (urlBuilder)
// and then returns the list of endpoints as an array
const getEndpoints = async () => {
  try {
    const count = await getPages(url);
    const eta = (count*2)/60 < 1 ? 
      `${Math.round(count*2)} seconds` : 
      `${Math.round((count*2)/60)} minutes`
    console.log(`Total pages: ${count}\nETA: ${eta}`);
    return urlBuilder(count);
  } catch (err){
    console.log(err);
  }
}

// this gets and returns the number of pages
// async function getPages(url){
const getPages = async (url) => {
  try {
    const result = await request(url)
    const pageCount = JSON.parse(result).findCompletedItemsResponse[0].paginationOutput[0].totalPages[0]
    return pageCount;
  } catch (err){
    console.log(err);
  }
}

// this takes the number of pages and
// builds and returns an endpoint list
// as an array
function urlBuilder(pages){
  let urls = [], maxlength = Math.min(pages, 100);
  for (let i = 0; i < maxlength; i++) {
    urls.push(url + `&paginationInput.pageNumber=${i + 1}`);
  }
  return urls;
}