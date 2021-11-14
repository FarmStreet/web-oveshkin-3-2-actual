function calculateFirst() {

  let a = Number(document.getElementById('input-1').value);
  let b = Number(document.getElementById('input-2').value);
  let h = Number(document.getElementById('input-3').value);

  if (isNaN(a)) {
    sendError(1, 'Неверный формат числа a!');
    return;
  }
  if (isNaN(b)) {
    sendError(1, 'Неверный формат числа b!');
    return;
  }
  if (isNaN(h)) {
    sendError(1, 'Неверный формат числа h!');
    return;
  }

  let tokenArray = tokenize(document.getElementById('input-form').value);

  if (!tokenArray) {
    sendError(1, 'Неверный формат функции!');
    return;
  }

  let tabArr = tabulation(a, b, h, tokenArray);

  let maxArr = getMaxArray(tabArr.resultArray);
  let minArr = getMinArray(tabArr.resultArray);
  let isMon = checkMon(tabArr.resultArray);

  let result = getTabResult(tabArr.resultArray, tabArr.stepArray);

  result += '<br/>' + 'Max F(' + tabArr.stepArray[maxArr.max_i] + ') = ' + maxArr.max + '<br/>' +
    'Min F(' + tabArr.stepArray[minArr.min_i] + ') = ' + minArr.min + '<br/>' +
    'Функция' + (isMon ? ' ' : ' не ') + 'монотонна' + '<br/>';

  console.log(isMon);

  $('#result').html(result);
}


function getTabResult(arr, stepArr) {
  let result = '';
  for (let i = 0; i < arr.length; i++) {
    result += 'F(' + stepArr[i] + ')=' + arr[i] + '<br/>';
  }
  return result;
}

function tabulation(a, b, h, tokenArray) {
  let resultArray = [];
  let stepArray = [];

  if (a < b) {
    for (let i = a; i <= b; i += h) {
      resultArray.push(superInterpretator(tokenArray, i));
      stepArray.push(i);
    }
  } else {
    for (let i = a; i >= b; i -= h) {
      resultArray.push(superInterpretator(tokenArray, i));
      stepArray.push(i);
    }
  }


  return {
    resultArray: resultArray,
    stepArray: stepArray,
  }
}

function sendError(id, text) {
  $('#result').html(text);
}

function getValues(a, b, c) {
  let d = b*b - 4*a*c;
  let x1 = d >= 0 ? (-b+Math.sqrt(d))/(2*a) : 0;
  let x2 = d >= 0 ? (-b-Math.sqrt(d))/(2*a) : 0;
  return {
    d: d,
    x1: x1,
    x2: x2,
  };

}

function clearMessages() {
  console.log('tesat');
  $('#input-form').val('');
  $('#input-1').val('');
  $('#input-2').val('');
  $('#input-3').val('');
  $('#result').html('');
}

function clearErrors() {
  $('#input-1').removeClass('error');
  $('#input-2').removeClass('error');
  $('#input-3').removeClass('error');
  $('#input-log-1').html('');
  $('#input-log-2').html('');
  $('#input-log-3').html('');
}

function Token(type, value) {
  this.type = type;
  this.value = value;
}

function isComma(ch) {
  return /,/.test(ch);
}

function isDigit(ch) {
  return /\d/.test(ch);
}

function isLetter(ch) {
  return /[a-z]/i.test(ch);
}

function isOperator(ch) {
  return /\+|-|\*|\/|\^/.test(ch);
}

function isLeftParenthesis(ch) {
  return /\(/.test(ch);
}

function isRightParenthesis(ch) {
  return /\)/.test(ch);
}

function tokenize(str) {
  str.replace(/\s+/g, "");
  str=str.split("");

  var result=[];
  var letterBuffer=[];
  var numberBuffer=[];

  str.forEach(function (char, idx) {
    if(isDigit(char)) {
      numberBuffer.push(char);
    } else if(char==".") {
      numberBuffer.push(char);
    } else if (isLetter(char)) {
      if(numberBuffer.length) {
        emptyNumberBufferAsLiteral();
        result.push(new Token("Operator", "*"));
      }
      letterBuffer.push(char);
    } else if (isOperator(char)) {
      emptyNumberBufferAsLiteral();
      emptyLetterBufferAsVariables();
      result.push(new Token("Operator", char));
    } else if (isLeftParenthesis(char)) {
      if(letterBuffer.length) {
        result.push(new Token("Function", letterBuffer.join("")));
        letterBuffer=[];
      } else if(numberBuffer.length) {
        emptyNumberBufferAsLiteral();
        result.push(new Token("Operator", "*"));
      }
      result.push(new Token("Left Parenthesis", char));
    } else if (isRightParenthesis(char)) {
      emptyLetterBufferAsVariables();
      emptyNumberBufferAsLiteral();
      result.push(new Token("Right Parenthesis", char));
    } else if (isComma(char)) {
      emptyNumberBufferAsLiteral();
      emptyLetterBufferAsVariables();
      result.push(new Token("Function Argument Separator", char));
    }
  });

  if (numberBuffer.length) {
    emptyNumberBufferAsLiteral();
  }

  if(letterBuffer.length) {
    emptyLetterBufferAsVariables();
  }

  return result;

  function emptyLetterBufferAsVariables() {
    var l = letterBuffer.length;
    for (var i = 0; i < l; i++) {
      result.push(new Token("Variable", letterBuffer[i]));
      if(i< l-1) { //there are more Variables left
        result.push(new Token("Operator", "*"));
      }
    }
    letterBuffer = [];
  }

  function emptyNumberBufferAsLiteral() {
    if(numberBuffer.length) {
      result.push(new Token("Literal", numberBuffer.join("")));
      numberBuffer=[];
    }
  }
}

function getMaxArray(array) {
  let max = array[0];
  let max_i = 0;

  for (let i = 0; i < array.length; i++) {
    if (max < array[i]) {
      max = array[i];
      max_i = i;
    }
  }

  return {
    max: max,
    max_i: max_i,
  }
}

function getMinArray(array) {
  let min = array[0];
  let min_i = 0;

  for (let i = 0; i < array.length; i++) {
    if (min > array[i]) {
      min = array[i];
      min_i = i;
    }
  }

  return {
    min: min,
    min_i: min_i,
  }
}

function checkMon(arr) {
  let seqGrow = 0;
  for (let i = 1; i < arr.length; i++) {
    const pairGrow = Math.sign(arr[i] - arr[i - 1]);

    if (pairGrow === 0) {
      continue;
    }

    seqGrow = seqGrow || pairGrow;

    if (pairGrow !== seqGrow) {
      return false;
    }
  }
  return true;
}

function getNewArray(old_array) {
  let new_array = [];
  for (let i = 0; i < old_array.length; i++) {
    new_array.push(old_array[i]);
  }
  return new_array;
}


function superInterpretator(token_array, x) {

  full_result = new Token("Literal", 1);
  temp_op = null;
  temp_array = getNewArray(token_array);
  for (let i = 0; i < temp_array.length; i++) {
    if (temp_array[i].type == "Operator") {
      if (temp_array[i].value == '^') {
        temp_array.splice(i-1, 3, operate(temp_array[i-1], temp_array[i].value, temp_array[i+1], x));
      };
    }
  }
  for (let i = 0; i < temp_array.length; i++) {
    if (temp_array[i].type == "Operator") {
      if (temp_array[i].value == '*' || temp_array[i].value == '/') {
        temp_array.splice(i-1, 3, operate(temp_array[i-1], temp_array[i].value, temp_array[i+1], x));
      };
    }
  }
  for (let i = 0; i < temp_array.length; i++) {
    if (temp_array[i].type == "Variable" || temp_array[i].type == "Literal") {
      full_result = operate(full_result, temp_op, temp_array[i], x);
    }
    if (temp_array[i].type == "Operator") {
      temp_op = temp_array[i].value;
    }
  }
  return full_result.value;
}

function operate(tokenPrev, op, tokenNext, x) {
  let prev = 0;
  let next = 0;
  if (tokenPrev.type == "Literal") prev = Number(tokenPrev.value);
  if (tokenPrev.type == "Variable") prev = x;
  if (tokenNext.type == "Literal") next = Number(tokenNext.value);
  if (tokenNext.type == "Variable") next = x;

  switch (op) {
    case '*': return new Token("Literal", prev * next);
    case '/': return new Token("Literal", prev / next);
    case '+': return new Token("Literal", prev + next);
    case '-': return new Token("Literal", prev - next);
    case '^': return new Token("Literal", Math.pow(prev, next));
    case null: return new Token("Literal", prev * next);
    default: return 0;
  }
}