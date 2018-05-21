function firstRun() {
  
// First get the API keys from the sheet
  
  var ss = SpreadsheetApp.getActive();
  var key = ss.getActiveSheet().getRange(2,9).getValue()
  var secret = ss.getActiveSheet().getRange(5,9).getValue()

// Take a timestamp
  
  var currentTime = Number(new Date().getTime()).toFixed(0);
  var string = "timestamp=" + currentTime;
  
// Encrypt keys
  
  var sKey = Utilities.computeHmacSha256Signature(string, secret);
  sKey = sKey.map(function(e) {
      var v = (e < 0 ? e + 256 : e).toString(16);
      return v.length == 1 ? "0" + v : v;
  }).join("");
  
// Send the request to the Binance API and receive the user data.
  
  var params = {
    'method': 'get',
    'headers': {'X-MBX-APIKEY': key},
    'muteHttpExceptions': true
  };

  var url = "https://api.binance.com/api/v3/account?" + string + "&signature=" + sKey;
  var response = UrlFetchApp.fetch(url, params);
  var json = response.getContentText();  
  var data = JSON.parse(json);

// Take the non-zero balances and respective asset symbols from the received data.
  
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
  

// And write those to a Google sheet.
  
  var ss = SpreadsheetApp.getActive();
  var writeSymbol = ss.getActiveSheet().getRange(11,2,symbolArray.length,symbolArray[0].length)
  writeSymbol.setValues(symbolArray)
  var writeBalance = ss.getActiveSheet().getRange(11,4,balanceArray.length,balanceArray[0].length)
  writeBalance.setValues(balanceArray)
}

function updateBalances() {

  var ss = SpreadsheetApp.getActive();
  var key = ss.getActiveSheet().getRange(2,9).getValue();
  var secret = ss.getActiveSheet().getRange(5,9).getValue();
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
  
  //We don't need write the symbols here since we did it with "firstRun" -- problem occurs if assets change though.  
  //var writeSymbol = ss.getActiveSheet().getRange(2,1,symbolArray.length,symbolArray[0].length) 
  //writeSymbol.setValues(symbolArray)
  
  var writeBalance = ss.getActiveSheet().getRange(11,6,balanceArray.length,balanceArray[0].length)
  writeBalance.setValues(balanceArray)

// Let's get the values of all the assets from Binance as well.

  ss.getActiveSheet().getRange(11,3).setValue(1) //put in the value of BTC as 1
  var coinArray = [];
  for (var i in symbolArray){
    if (symbolArray[i] != "BTC"){    // There's no "BTC/BTC" pairing, of course.
      if (symbolArray[i] != "BTM"){ 
        if (symbolArray[i] !="SBTC"){
          if (symbolArray[i] !="BCX"){
            if (symbolArray[i] !="ETF"){
              var ticker = symbolArray[i]  
              var price = UrlFetchApp.fetch("https://api.binance.com/api/v3/ticker/price?symbol=" + ticker + "BTC");
              var priceJson = price.getContentText();
              var priceData = JSON.parse(priceJson);
              var coinPrice = parseFloat(priceData['price'])           
  //          coinArray.push([coinPrice])}}}}}}   not doing it this way anymore, can probably delete
            var numInArray = parseFloat(i)
            var rowNumber = numInArray + 11
            var priceLoc = ss.getActiveSheet().getRange(rowNumber,3)
            priceLoc.setValue(coinPrice)
          }}}}}}}
