// We want to request user information from the Binance API, and put the account balances in a Google Sheet.

function getAccountBalances() {

// First, we need to define variables for the API keys, get the current time, and encode the API secret in order to send it to Binance.

  var key = '***your Binance API key***';
  var secret = '***your Binance API secret***';
  var currentTime = Number(new Date().getTime()).toFixed(0);
  var string = "timestamp=" + currentTime;
  var sKey = Utilities.computeHmacSha256Signature(string, secret);
  sKey = sKey.map(function(e) {
      var v = (e < 0 ? e + 256 : e).toString(16);
      return v.length == 1 ? "0" + v : v;
  }).join("");
  
  // Next, send the request to the API and receive the user data.
  
  var params = {
    'method': 'get',
    'headers': {'X-MBX-APIKEY': key},
    'muteHttpExceptions': true
  };

  var url = "https://api.binance.com/api/v3/account?" + string + "&signature=" + sKey;
  var response = UrlFetchApp.fetch(url, params);
  var json = response.getContentText();  
  var data = JSON.parse(json);

// We want to separate out the important parts of the received data. In this case, the balances and the symbols
// for the assets those balances are in. And we don't care about balances that are 0.
  
  var balanceArray = [];
  var symbolArray = [];
  var balances = data.balances;
    
    for (var j in balances){
      if (balances[j].free > 0)
        if (balances[j].asset != "BTM"){     // These are coins that aren't trading on Binance, but exist in wallets there.
          if (balances[j].asset !="SBTC"){
            if (balances[j].asset !="BCX"){
              if (balances[j].asset !="ETF"){
      balanceArray.push([balances[j].free])
      symbolArray.push([balances[j].asset])
              }}}}}
  

// Now we want to write those lists to a Google sheet.
  
var ss = SpreadsheetApp.getActive();
var writeSymbol = ss.getActiveSheet().getRange(2,1,symbolArray.length,symbolArray[0].length)
writeSymbol.setValues(symbolArray)
var writeBalance = ss.getActiveSheet().getRange(2,2,balanceArray.length,balanceArray[0].length)
writeBalance.setValues(balanceArray)

// Let's get the values of all the assets from Binance as well.

var coinArray = [];

for (var j in symbolArray){
  if (symbolArray[j] != "BTC"){    // There's no "BTC/BTC pairing, of course.
    if (symbolArray[j] != "BTM"){ 
      if (symbolArray[j] !="SBTC"){
        if (symbolArray[j] !="BCX"){
          if (symbolArray[j] !="ETF"){
            var ticker = symbolArray[j]  
            var price = UrlFetchApp.fetch("https://api.binance.com/api/v3/ticker/price?symbol=" + ticker + "BTC");
            var priceJson = price.getContentText();
            var priceData = JSON.parse(priceJson);
            var coinPrice = parseFloat(priceData['price'])
            coinArray.push([coinPrice])}}}}}}
  ss.getActiveSheet().getRange(2,3).setValue(1)
  
 // And write those into the sheet.
  
  var writePrice = ss.getActiveSheet().getRange(3,3,coinArray.length,coinArray[0].length)
  writePrice.setValues(coinArray)
  
  }
