function calculate(amount){
    if(amount>0){    
        var comision=document.getElementById('comision');
        var transferencia=document.getElementById('transferencia');
        var total=document.getElementById('total');
        var comPrice = getComission(amount);
        var transPrice = parseInt((amount * 0.015) + 75000);
        var realPrice = comPrice + transPrice + parseInt(amount);
        comision.innerHTML = toCurrency(comPrice);
        transferencia.innerHTML = toCurrency(transPrice);
        total.innerHTML = toCurrency(realPrice);
        console.log('calculated comision, tranf, amount',comPrice, transPrice, amount, comPrice + transPrice + amount);
    }
}

window.addEventListener('load', function() {
    console.log('Window loaded!');

    var monto = document.getElementById('monto');
    monto.addEventListener('input', function (evt) {
        //console.log('change', 'value', evt.target.value);
        calculate(evt.target.value);
    });

    console.log('chrome', chrome);
}, false);