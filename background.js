//TODO check DOM, find offers and add comission, transfer and other costs... Also try to find fiscal and comercial values...

var check = document.getElementsByClassName('detalleFicha ').length > 0;
if (check) {
  runView();
}

var end=false;
setTimeout(function(){
  if(!end){
    end=true;
    var remate = document.getElementsByClassName('winner-mount').length > 0;
    if(remate){
      console.log('modo remate');
      var lotes = document.getElementsByTagName("article");
      console.log('lotes', lotes);
    }
  }
}, 5000);


function toCurrency(amount) {
  return "$ " + formatNumber(parseInt(amount));
};

function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
}

function leftOnlyNumbers(obj) {
  if (!obj)
    return 0;
  return obj.replace(/\D/g, '');
}

function getRealPrice(price, fiscalValue = 0) {
  if (fiscalValue < price)
    return parseInt(price + getComission(price) + (price * 0.015) + 75000);
  else {
    return parseInt(price + getComission(price) + (fiscalValue * 0.015) + 75000);
  }
}

function getComission(price) {
    return price * 0.125;
}

function runView(doc) {
  if(!doc)
    doc = document;
  var brand = doc.getElementsByClassName('especificacion')[0].lastElementChild.innerText
  var model = doc.getElementsByClassName('especificacion')[1].lastElementChild.innerText;
  var version = doc.getElementsByClassName('especificacion')[2].lastElementChild.innerText;
  var year = leftOnlyNumbers(doc.getElementsByClassName('especificacion')[3].lastElementChild.innerText);
  var kms = leftOnlyNumbers(doc.getElementsByClassName('especificacion')[4].lastElementChild.innerText);
  var traction = doc.getElementsByClassName('especificacion')[5].lastElementChild.innerText;
  var combustible = doc.getElementsByClassName('especificacion')[6].lastElementChild.innerText;
  var engine = doc.getElementsByClassName('especificacion')[7].lastElementChild.innerText;
  var transmision = doc.getElementsByClassName('especificacion')[8].lastElementChild.innerText;
  var id = doc.getElementsByClassName('especificacion')[9].lastElementChild.innerText;
  var inspection = doc.getElementsByClassName('sectionBtnEspecial').length > 0 ? "https://www.macal.cl" + doc.getElementsByClassName('sectionBtnEspecial')[0].getElementsByTagName('a')[0].getAttribute('href') : null;
  var price = leftOnlyNumbers(doc.getElementsByClassName('minimoContenedor')[0].innerText);
  var dataLayer = eval(Array.from(doc.querySelectorAll('script')).filter(s => s.innerText.includes("dataLayer ="))[0].innerHTML);
  var fiscalValue = leftOnlyNumbers(dataLayer[0].caracteristicas.split('/').filter(f => f.includes("Fiscal"))[0]);

  var linkMultas = "https://www.sem.gob.cl/pcirc/buscar_multas.php?patente=" + id;

  var maxPrice =  parseInt(fiscalValue) - 1000000;
  maxPrice = maxPrice - getComission(maxPrice);

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
    "maxPrice": maxPrice,
    "maxPriceComission": getComission(maxPrice),
    "data": dataLayer[0],
    "simulatedPrices": [],
    "muchosKms": false,
    "link_multas": linkMultas 
  };


  //identificar temas como mucho kms con pocos años, motor muy gastador, en algun futuro usar la patente para buscar partes, etc..
  var maxKmsYear = 25000;
  data.muchosKms = data.kms > ((new Date().getFullYear() - data.year) * maxKmsYear);

  //precios con comision, transferencia, etc...
  var percentage = 0;
  for (percentage = 0; percentage < 200; percentage += 50) {
    var price = data.price + data.price * (percentage / 100);
    var realPrice = getRealPrice(price, data.fiscalPrice);
    var comission = getComission(price);
    data.simulatedPrices.push({
      percentage,
      realPrice,
      comission,
      price
    });
  }

  console.log(data);


  //add info
  var section = doc.getElementsByClassName('detalleFicha')[0];
  var title = doc.createElement("div");
  title.className = "col-xs-12";
  title.innerHTML += "<br /><b>Información adicional:</b> ";
  title.innerHTML += "<a target=\"_blank\" href=\"" + data.link_multas + "\">Multas no pagadas?</a><br /><br />";
  title.innerHTML += "<div class=\"col-xs-4 especificacion\"><span>Precio Fiscal</span><span>" + toCurrency(data.fiscalPrice) + "</span></div>";
  title.innerHTML += "<div class=\"col-xs-4 especificacion\"><span>Comisi&oacute;n inicial</span><span>" + toCurrency(getComission(data.price)) + "</span></div>";
  title.innerHTML += "<div class=\"col-xs-4 especificacion\"><span>¿Muchos Kms?</span><span>" + (data.muchosKms ? "SI" : "NO") + "</span></div>";
  title.innerHTML += "<div class=\"col-xs-4 especificacion\"><span>Max Precio Puja</span><span><b>" + toCurrency(data.maxPrice) + "</b></span></div>";
  title.innerHTML += "<div class=\"col-xs-4 especificacion\"><span>Comisi&oacute;n Precio Puja</span><span><b>" + toCurrency(data.maxPriceComission) + "</b></span></div>";
  title.innerHTML += "<div class=\"col-xs-4 especificacion\"><span>Precio Final Puja</span><span><b>" + toCurrency(getRealPrice(data.maxPrice, data.fiscalPrice)) + "</b></span></div>";
  section.appendChild(title);
  var table = doc.createElement("div");
  table.className = "col-xs-12";
  data.simulatedPrices.forEach(price => {
    var row = doc.createElement("div");
    row.className = "col-xs-4 especificacion";
    var col1 = doc.createElement("span");
    col1.innerHTML = toCurrency(price.price) + "<small>(min + " + price.percentage  + " %)</small>";
    var col2 = doc.createElement("span");
    col2.innerHTML = "<b>" + toCurrency(price.realPrice) + "</b><br /><small>(" + toCurrency(price.comission) + ")</small>";
    row.appendChild(col1);
    row.appendChild(col2);
    table.appendChild(row);
  });

  //section.appendChild(table);

  var title2 = doc.createElement("div");
  title2.className = "col-xs-12";
  title2.innerHTML += "<b>Otras caracteristicas:</b><br /><br />";
  title2.innerHTML += "<span>" + data.data.caracteristicas + "</span>";
  section.appendChild(title2);

  var footer = doc.createElement("span");
  footer.innerHTML = "<br /><span class=\"pull-right\">JAMTech.cl</span>";
  section.appendChild(footer);
}