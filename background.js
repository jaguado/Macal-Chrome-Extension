//TODO check DOM, find offers and add comission, transfer and other costs... Also try to find fiscal and comercial values...

var check = document.getElementsByClassName('detalleFicha ').length > 0;
if (check) {
  run();
}

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
  var inspection = document.getElementsByClassName('sectionBtnEspecial').length > 0 ? "https://www.macal.cl" + document.getElementsByClassName('sectionBtnEspecial')[0].getElementsByTagName('a')[0].getAttribute('href') : null;
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
    "muchosKms": false
  };


  //identificar temas como mucho kms con pocos años, motor muy gastador, en algun futuro usar la patente para buscar partes, etc..
  var maxKmsYear = 25000;
  data.muchosKms = data.kms > ((new Date().getFullYear() - data.year) * maxKmsYear);

  //precios con comision, transferencia, etc...
  var percentage = 0;
  for (percentage = 0; percentage < 90; percentage += 10) {
    var tempPrice = data.price + data.price * (percentage / 100);
    var realPrice = getRealPrice(tempPrice, data.fiscalPrice);
    var comission = getComission(tempPrice);
    data.simulatedPrices.push({
      percentage,
      realPrice,
      comission
    });
  }

  //console.log(data);


  //add info
  var section = document.getElementsByClassName('detalleFicha')[0];
  var title = document.createElement("div");
  title.className = "col-xs-12";
  title.innerHTML += "<b>Información adicional:</b><br /><br />";
  title.innerHTML += "<div class=\"col-xs-4 especificacion\"><span>Precio Fiscal</span><span>" + toCurrency(data.fiscalPrice) + "</span></div>";
  title.innerHTML += "<div class=\"col-xs-4 especificacion\"><span>Comisi&oacute;n inicial</span><span>" + toCurrency(getComission(data.price)) + "</span></div>";
  title.innerHTML += "<div class=\"col-xs-4 especificacion\"><span>¿Muchos Kms?</span><span>" + (data.muchosKms ? "SI" : "NO") + "</span></div>";
  section.appendChild(title);
  var table = document.createElement("div");
  table.className = "col-xs-12";
  data.simulatedPrices.forEach(price => {
    var row = document.createElement("div");
    row.className = "col-xs-4 especificacion";
    var col1 = document.createElement("span");
    col1.innerHTML = price.percentage + "% adicional";
    var col2 = document.createElement("span");
    col2.innerHTML = toCurrency(price.realPrice) + "<br /><small>(" + toCurrency(price.comission) + ")</small>";
    row.appendChild(col1);
    row.appendChild(col2);
    table.appendChild(row);
  });

  section.appendChild(table);

  var title2 = document.createElement("div");
  title2.className = "col-xs-12";
  title2.innerHTML += "<b>Otras caracteristicas:</b><br /><br />";
  title2.innerHTML += "<span>" + data.data.caracteristicas + "</span>";
  section.appendChild(title2);

  var footer = document.createElement("span");
  footer.innerHTML = "<br /><span class=\"pull-right\">JAMTech.cl</span>";
  section.appendChild(footer);
}