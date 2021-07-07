

/* 
 * This is a vanilla javascript (does not use any external library like jQuery)
*  Therefore, this may or may not work properly on different browsers
 */ 

var display      = "0";
var num1         = null;
var num2         = null;
var operator     = null;
var clearDisplay = false;
var debugCnt     = 0;
var curNumber    = 'num1';
var displayFontSize = 0;
var minDisplayFontSize = 10

main();

function main()
{
    document.addEventListener('DOMContentLoaded', ready, false);
}

function ready()
{

    var btns = document.getElementsByClassName('common_btn');

    displayFontSize = window.getComputedStyle(document.getElementById('calc_display')).fontSize;
    displayFontSize = displayFontSize.replace(/px/, '');


    for(var i = 0; i < btns.length; i++) 
    {
        btns[i].addEventListener('click', doInput, false);
    }

    document.addEventListener("keypress", function(event) {
        
        var acceptableKeys = ['1','2','3','4','5','6','7','8','9','0',
                              '.', '+', '-', '*', 'x', '/', '%', '='];

        if (acceptableKeys.includes(event.key))
        {  
            var key = event.key;

            if (key == '*')
                key = 'x';

            var dataKey = '[data-key="' + key + '"]';
            console.log("find data-key = " + dataKey);
            var button = document.querySelectorAll(dataKey)[0];
            var pressedKey = button.innerText;

   
            console.log("USER PRESSED = " + pressedKey);
            button.click();

         

        } 
      
    });

    setupInfo();

  
}

/* 
 * The input router -- directs input to number or operator function
 */
function doInput()
{   
    var input = this.innerHTML;
    var btnValue = parseInt(input);

    if (isNaN(btnValue))
    {
        // this is not a digit
        doOpInput(input);
    } else {

        // This is a digit
        doNumInput(input);
    }
}

function doOpInput(op)
{
    // If operator is decimal symbol
    if (op == '.')
       return doDecimal();

    if (op == '%')
       return doPercent();


    x = getDisplayValue();

    if (curNumber == 'num1')
    {
        num1 = Number(x);
        clearDisplay = true;
   
    } else {

        num2 = Number(x);
    }

    // is the current operator a special one?
    // if it is AC or C then handle it here
    if (handleSpecialOperators(op))
       return true;


    if (num1 != null && num2 != null && operator != null)
       return doMath(num1, operator, num2);

    operator = op;
    curNumber = 'num2'; 

}

function doNumInput(num)
{
    updateDisplay(num);
    setClearBtn();
}

function setClearBtn()
{
    var clearBtn = document.querySelector('#clear_btn');
    clearBtn.innerHTML = 'C';

}

function setAllClearBtn()
{
    var clearBtn = document.querySelector('#clear_btn');
    clearBtn.innerHTML = 'AC';
}   

function handleSpecialOperators(op)
{

    // If operator is AC, it's special
    if (op == 'AC')
        return doAllClear();

    // If operator is C, it's special
    else if (op == 'C')
        return doClear();

    // If the +/- operator is clicked on
    // change the sign of the current number
    else if (op == '±')
        return changeNumberSign();
    
        // Not special
    return false;
}

function changeNumberSign()
{
    console.log("Came to change number sign for " + curNumber);

    if (curNumber == 'num1')
    {
        num1 = -1 * Number(num1);
        display = num1;
    } else {
        num2 = -1 * Number(num2);
        display = num2;
    }
    

    writeToDisplay(display);
    clearDisplay = true;

    return true;
}

function doPercent()
{
    console.log('Came to doPercent');
    console.log('Current num: ' + curNumber);

    if (num1 == null)
       display = Number(display/100);
    else
       display = Number(num1 * (display/100));

    writeToDisplay(display);
    return true;
}

function doDecimal()
{
    var curValue = getDisplayValue();
    var decimalRE = new RegExp(/\./);

    if (clearDisplay)
    {
        curValue = 0;
        writeToDisplay(curValue);
        clearDisplay = false;
    }

    if (decimalRE.test(curValue))
    {
        // we already have a decimal
        console.log("Already has decimal in " + curValue);
        return true;
    }

    curValue = curValue + '.';
    writeToDisplay(curValue);
    return true;
}

function doClear()
{

    debug();
    if (num2 != null)
        num2 = null;
    else if (num1 != null)
        num1 = null;

    debug();
    writeToDisplay('0');
    setAllClearBtn();
    return true;
}

function doAllClear()
{
    writeToDisplay('');
    num1 = null;
    num2 = null;
    operator = null;
    display = null;
    clearDisplay = false;
    return true;
}


function updateDisplay(newValue)
{
    var curValue = getDisplayValue();

    if (curValue == "0")
        curValue = "";

    if (clearDisplay)
    {
        display = newValue;
        clearDisplay = false;
    } else {

        display = curValue+ newValue;
    }

    writeToDisplay(display);
}

function writeToDisplay(x)
{
    var displayArea = document.querySelector('.calc_display');
    displayArea.value = x;

    if (x.length >= 12)
    {
        displayFontSize = Number(displayFontSize - 2);

        if (displayFontSize >= minDisplayFontSize)
        {
            displayArea.style.fontSize = displayFontSize.toString() + 'px';
        }
    }

}

function getDisplayValue()
{
    var displayArea = document.querySelector('.calc_display');
    return displayArea.value;
}

function clearDisplay()
{
    var displayArea = document.querySelector('.calc_display');
    displayArea.value = "";
    display = null;

}

function isInt(n) 
{
    return n % 1 === 0;
}

function doMath(x, op, y)
{

    var error = false;


    if (op == '+') {
        f = x + y;
    } else if (op == '-') {
        f = x - y;
    } else if (op == 'x') {
        f = x * y;
    } else if (op == '÷') {

        if (y == 0)
        {
            f = 'Not a number';
            error = true;

        } else {
            
            f = x / y;
            // We are going to limit results to
            // 12 decimal points
            // we will also remote trailing zerors
            f = Number(f).toPrecision(12).toString().replace(/0+$/,'').replace(/\.$/, '');
            num1 = f;
        }
    }
    

    num2 = null;

    if (!error)
       curNumber = 'num1';
   
       operator = null;
    debug();

    // Now that result (f) is in num1
    // we must clear the display if user presses
    // a number key
    clearDisplay = true;
    console.log("SHOW result f = " +f);
    writeToDisplay(f);
    return f;

}

function debug()
{
    console.log("=========== [" + debugCnt + "] ===========");
    console.log('Current number : ' + curNumber);
    console.log("Number 1: " + num1);
    console.log("Number 2: " + num2);
    console.log("Operator: " + operator);
    console.log("clearDisplay flag: " + clearDisplay);
    debugCnt++

}

function setupInfo()
{
    $('#author').text('Ethan Kabir');
    $('#year').text(new Date().getFullYear());
    $('#website').attr('href', 'https://ethankabir.com');
}