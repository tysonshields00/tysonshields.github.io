/**
 * script.js - Calculator Logic
 * Located in: src/apps/calculator/
 */

document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const buttons = document.querySelector('.calc-buttons');

    let currentInput = '0';
    let previousInput = '';
    let operator = null;
    let shouldResetScreen = false;

    buttons.addEventListener('click', (e) => {
        const btn = e.target;
        if (!btn.matches('button')) return;

        const action = btn.dataset.action;
        const btnValue = btn.textContent;

        // Handle Numbers
        if (!action) {
            handleNumber(btnValue);
        } 
        // Handle Operators
        else if (['add', 'subtract', 'multiply', 'divide'].includes(action)) {
            handleOperator(action);
        } 
        // Handle Utilities/Equals
        else {
            handleSpecialAction(action);
        }

        updateDisplay();
    });

    function handleNumber(num) {
        if (currentInput === '0' || shouldResetScreen) {
            currentInput = num;
            shouldResetScreen = false;
        } else {
            // Prevent multiple decimals
            if (num === '.' && currentInput.includes('.')) return;
            currentInput += num;
        }
    }

    function handleOperator(nextOperator) {
        if (operator !== null) calculate();
        previousInput = currentInput;
        operator = nextOperator;
        shouldResetScreen = true;
    }

    function handleSpecialAction(action) {
        if (action === 'clear') {
            currentInput = '0';
            previousInput = '';
            operator = null;
        } else if (action === 'delete') {
            currentInput = currentInput.slice(0, -1) || '0';
        } else if (action === 'calculate') {
            calculate();
            operator = null;
        }
    }

    function calculate() {
        let result;
        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);

        if (isNaN(prev) || isNaN(current)) return;

        switch (operator) {
            case 'add': result = prev + current; break;
            case 'subtract': result = prev - current; break;
            case 'multiply': result = prev * current; break;
            case 'divide': 
                result = current === 0 ? 'Error' : prev / current; 
                break;
            default: return;
        }

        currentInput = result.toString();
        shouldResetScreen = true;
    }

    function updateDisplay() {
        if (currentInput === 'Error') {
            display.textContent = currentInput;
            return;
        }

        const num = parseFloat(currentInput);
        display.textContent = currentInput.length > 12
            ? num.toPrecision(8)
            : Utils.formatNumber(currentInput);
    }
});