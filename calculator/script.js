
// ===============================
// CALC. - STANDARD CALCULATOR
// ===============================

const currentDisplay =
  document.getElementById("currentDisplay");

const previousDisplay =
  document.getElementById("previousDisplay");

const buttons =
  document.querySelectorAll(".btn");

// CALCULATOR STATE

let currentValue = "0";
let previousValue = null;
let operator = null;

let waitingForNextValue = false;
let justCalculated = false;
let errorState = false;

// FORMAT DISPLAY

function formatDisplay(value) {
  if (value === "Error") return "Error";

  const text = String(value);

  if (text === "-") return "-";

  const negative = text.startsWith("-");
  const unsigned = negative ? text.slice(1) : text;

  const parts = unsigned.split(".");

  let integerPart = parts[0];

  if (integerPart === "") {
    integerPart = "0";
  }

  integerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ","
  );

  let result = (negative ? "-" : "") + integerPart;

  if (parts.length > 1) {
    result += "." + parts[1];
  }

  return result;
}

// UPDATE SCREEN

function updateDisplay() {
  currentDisplay.textContent =
    formatDisplay(currentValue);

  if (operator !== null && previousValue !== null) {
    previousDisplay.textContent =
      formatDisplay(previousValue) +
      " " +
      getOperatorSymbol(operator);
  }

  document.querySelectorAll(".operator").forEach(btn => {
    btn.classList.toggle(
      "selected",
      btn.dataset.value === operator
    );
  });

  // Automatically adjust large numbers
  const length = currentDisplay.textContent.length;

  if (length > 15) {
    currentDisplay.style.fontSize = "28px";
  } else if (length > 11) {
    currentDisplay.style.fontSize = "36px";
  } else {
    currentDisplay.style.fontSize = "";
  }
}

// OPERATOR SYMBOL

function getOperatorSymbol(op) {
  switch (op) {
    case "+":
      return "+";

    case "-":
      return "−";

    case "*":
      return "×";

    case "/":
      return "÷";

    default:
      return "";
  }
}

// INPUT NUMBER

function inputNumber(number) {
  if (errorState) clearCalculator();

  if (waitingForNextValue || justCalculated) {
    currentValue = number;
    waitingForNextValue = false;
    justCalculated = false;

    if (operator === null) {
      previousDisplay.textContent = "";
    }

  } else if (currentValue === "0") {
    currentValue = number;

  } else if (currentValue === "-0") {
    currentValue = "-" + number;

  } else {
    // Maximum 15 digits
    const digitCount =
      currentValue.replace(/[^0-9]/g, "").length;

    if (digitCount >= 15) return;

    currentValue += number;
  }

  updateDisplay();
}

// DECIMAL POINT

function inputDecimal() {
  if (errorState) clearCalculator();

  if (waitingForNextValue || justCalculated) {
    currentValue = "0.";
    waitingForNextValue = false;
    justCalculated = false;

    if (operator === null) {
      previousDisplay.textContent = "";
    }

  } else if (!currentValue.includes(".")) {
    currentValue += ".";
  }

  updateDisplay();
}

// CLEAR CALCULATOR

function clearCalculator() {
  currentValue = "0";
  previousValue = null;
  operator = null;

  waitingForNextValue = false;
  justCalculated = false;
  errorState = false;

  previousDisplay.textContent = "";

  updateDisplay();
}

// PLUS / MINUS

function toggleSign() {
  if (errorState) return;

  if (currentValue.startsWith("-")) {
    currentValue = currentValue.slice(1);
  } else if (Number(currentValue) !== 0) {
    currentValue = "-" + currentValue;
  }

  updateDisplay();
}

// PERCENTAGE

function percentage() {
  if (errorState) return;

  const value = Number(currentValue) / 100;

  currentValue = normalizeResult(value);

  updateDisplay();
}

// BACKSPACE

function backspace() {
  if (errorState) {
    clearCalculator();
    return;
  }

  if (waitingForNextValue) {
    return;
  }

  if (justCalculated) {
    justCalculated = false;
    previousDisplay.textContent = "";
  }

  if (
    currentValue.length <= 1 ||
    (currentValue.length === 2 &&
      currentValue.startsWith("-"))
  ) {
    currentValue = "0";
  } else {
    currentValue = currentValue.slice(0, -1);
  }

  updateDisplay();
}

// NORMALIZE RESULT

function normalizeResult(number) {
  if (!Number.isFinite(number)) {
    return "Error";
  }

  if (number === 0) return "0";

  const rounded = Number(number.toPrecision(12));

  return String(rounded);
}

// CALCULATE

function calculate(a, b, op) {
  switch (op) {
    case "+":
      return a + b;

    case "-":
      return a - b;

    case "*":
      return a * b;

    case "/":
      if (b === 0) return NaN;
      return a / b;

    default:
      return b;
  }
}

// ERROR

function showError() {
  currentValue = "Error";
  previousValue = null;
  operator = null;

  waitingForNextValue = false;
  justCalculated = false;
  errorState = true;

  previousDisplay.textContent = "";

  updateDisplay();
}

// SELECT OPERATOR

function selectOperator(nextOperator) {
  if (errorState) return;

  if (operator !== null && waitingForNextValue) {
    operator = nextOperator;
    updateDisplay();
    return;
  }

  if (operator !== null && previousValue !== null) {
    const result = calculate(
      Number(previousValue),
      Number(currentValue),
      operator
    );

    const normalized = normalizeResult(result);

    if (normalized === "Error") {
      showError();
      return;
    }

    currentValue = normalized;
  }

  previousValue = currentValue;
  operator = nextOperator;

  waitingForNextValue = true;
  justCalculated = false;

  updateDisplay();
}

// EQUALS

function equals() {
  if (
    errorState ||
    operator === null ||
    previousValue === null
  ) {
    return;
  }

  const firstNumber = Number(previousValue);
  const secondNumber = Number(currentValue);

  const expression =
    formatDisplay(previousValue) +
    " " +
    getOperatorSymbol(operator) +
    " " +
    formatDisplay(currentValue) +
    " =";

  const result = calculate(
    firstNumber,
    secondNumber,
    operator
  );

  const normalized = normalizeResult(result);

  if (normalized === "Error") {
    showError();
    return;
  }

  currentValue = normalized;
  previousValue = null;
  operator = null;

  waitingForNextValue = false;
  justCalculated = true;

  updateDisplay();

  previousDisplay.textContent = expression;
}

// BUTTON CLICK HANDLING

buttons.forEach(button => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    const value = button.dataset.value;

    if (action === "clear") {
      clearCalculator();
      return;
    }

    if (action === "sign") {
      toggleSign();
      return;
    }

    if (action === "percent") {
      percentage();
      return;
    }

    if (action === "backspace") {
      backspace();
      return;
    }

    if (action === "decimal") {
      inputDecimal();
      return;
    }

    if (action === "operator") {
      selectOperator(value);
      return;
    }

    if (action === "equals") {
      equals();
      return;
    }

    if (/^[0-9]$/.test(value || "")) {
      inputNumber(value);
    }
  });
});

// KEYBOARD SUPPORT

document.addEventListener("keydown", event => {
  const key = event.key;

  if (/^[0-9]$/.test(key)) {
    inputNumber(key);
    return;
  }

  if (key === ".") {
    inputDecimal();
    return;
  }

  if (["+", "-", "*", "/"].includes(key)) {
    event.preventDefault();
    selectOperator(key);
    return;
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    equals();
    return;
  }

  if (key === "Backspace") {
    event.preventDefault();
    backspace();
    return;
  }

  if (key === "Escape" || key === "Delete") {
    event.preventDefault();
    clearCalculator();
    return;
  }

  if (key === "%") {
    percentage();
  }
});

// INITIALIZE

clearCalculator();
