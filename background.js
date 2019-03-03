//TODO check DOM, find offers and add comission, transfer and other costs... Also try to find fiscal and comercial values...

var check = document.getElementsByClassName('detalleFicha ').length > 0;
if (check) {
  run();
}

function leftOnlyNumbers(obj) {
  if(!obj)
    return 0;
  return obj.replace(/\D/g, '');
}

function getRealPrice(price, fiscalValue = 0) {
  if (fiscalValue<=0)
    return parseInt(price * 1.12 + 75000);
  else {
    return parseInt((price * 1.105) + (fiscalValue * 0.015) + 75000);
  }
}

function run() {
  var brand = document.getElementsByClassName('especificacion')[0].lastElementChild.innerText
  var model = document.getElementsByClassName('especificacion')[1].lastElementChild.innerText;
  var version = document.getElementsByClassName('especificacion')[2].lastElementChild.innerText;
  var year = leftOnlyNumbers(document.getElementsByClassName('especificacion')[3].lastElementChild.innerText);
  var kms = leftOnlyNumbers(document.getElementsByClassName('especificacion')[4].lastElementChild.innerText);
  var traction = document.getElementsByClassName('especificacion')[5].lastElementChild.innerText;
  var combustible = document.getElementsByClassName('especificacion')[6].lastElementChild.innerText;
  var engine = document.getElementsByClassName('especificacion')[7].lastElementChild.innerText;
  var transmision = document.getElementsByClassName('especificacion')[8].lastElementChild.innerText;
  var id = document.getElementsByClassName('especificacion')[9].lastElementChild.innerText;
  var inspection = document.getElementsByClassName('sectionBtnEspecial').length> 0 ? "https://www.macal.cl" + document.getElementsByClassName('sectionBtnEspecial')[0].getElementsByTagName('a')[0].getAttribute('href') : null;
  var price = leftOnlyNumbers(document.getElementsByClassName('minimoContenedor')[0].innerText);
  var dataLayer = eval(Array.from(document.querySelectorAll('script')).filter(s => s.innerText.includes("dataLayer ="))[0].innerHTML);
  var fiscalValue = leftOnlyNumbers(dataLayer[0].caracteristicas.split('/').filter(f => f.includes("Fiscal"))[0]);
  
  var data = {
    "id": id,
    "brand": brand,
    "model": model,
    "version": version,
    "year": parseInt(year),
    "kms": parseInt(kms),
    "traction": traction,
    "combustible": combustible,
    "engine": engine,
    "transmision": transmision,
    "inspectionUrl": inspection,
    "price": parseInt(price),
    "fiscalPrice": parseInt(fiscalValue),
    "data": dataLayer[0],
    "simulatedPrices": [],
    "muchosKms": null
  };


  //identificar temas como mucho kms con pocos años, motor muy gastador, en algun futuro usar la patente para buscar partes, etc..
  var maxKmsYear = 25000;
  data.muchosKms = data.kms > ((new Date().getFullYear() - data.year) * maxKmsYear);

  //precios con comision, transferencia, etc...
  var percentage = 0;
  for (percentage = 0; percentage < 60; percentage += 10) {
    var tempPrice = data.price + data.price * (percentage / 100);
    var realPrice = getRealPrice(tempPrice, data.fiscalPrice);
    data.simulatedPrices.push({percentage, realPrice});
  }

  console.log(data);
}