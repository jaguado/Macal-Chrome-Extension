var currentInfo = null;
var amountField = null;
function calculate(){
    var fiscalPrice = currentInfo != null && currentInfo.ValorFiscal ? currentInfo.ValorFiscal : 0;
    var amount = amountField.value;
    var comision=document.getElementById('comision');
    var transferencia=document.getElementById('transferencia');
    var total=document.getElementById('total');
    var comPrice = getComission(amount);
    var transPrice = getTransfPrice(amount>fiscalPrice ? amount : fiscalPrice);
    var realPrice = getRealPrice(amount, fiscalPrice);
    comision.innerHTML = toCurrency(comPrice);
    transferencia.innerHTML = toCurrency(transPrice);
    total.innerHTML = toCurrency(realPrice);

    //colors
    if(currentInfo.PrecioIdeal && currentInfo.PrecioMaximo<amount){
        total.style.color= "Red";
    }
    if(currentInfo.PrecioIdeal && currentInfo.PrecioIdeal>amount){
        total.style.color= "Green";
    }
    if(currentInfo.PrecioIdeal && currentInfo.PrecioIdeal<amount && currentInfo.PrecioMaximo>amount){
        total.style.color= "Black";
    }
    console.log('calculated comision, tranf, amount',comPrice, transPrice, amount, comPrice + transPrice + amount);
}

function loadInfo(){
    chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
        if(tab.length>0){
            tab = tab[0];
            var tabUrl = tab.url.split('/');
            var id = tabUrl[tabUrl.length -1];
            console.log('Bienid', id);
            $.get("https://aio.jamtech.cl/v1/Macal/0?idBien=" + id, function( data ) {
                currentInfo=data;
                console.log('current bien info', currentInfo);
                refreshInfo();
            });
        }
    });
}
function refreshInfo(){
    if(currentInfo.ValorFiscal){
        //now we can calculate more accurated amounts
        amountField.value = currentInfo.Precio;
        calculate();
    }
}
window.addEventListener('load', function() {
    amountField = document.getElementById('monto');
    amountField.addEventListener('input', function (evt) {
        calculate(evt.target.value);
    });
    loadInfo();   
}, false);