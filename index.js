// размер ячейки при выводе матрицы
const SETW_SIZE = 8;

// матрица
const matrix = [
    [15, 6, 25, 11, 12],
    [13, 14, 20, 27, 30],
    [16, 7, 19, 10, 21],
    [1, 29, 23, 25, 18],
];

// запасы (последний столбик)
const stocks = [9, 18, 23, 26];

// потребности (последняя строка)
const needs = [11, 22, 31, 6, 6];

// аналог setw из C++
const setw = (number, size) => {
    const stringNumber = String(number);
    const PADDING = ' '.repeat(size);
    const padded = (PADDING.substring(' ', PADDING.length - stringNumber.length) + stringNumber);
    return padded;
}

// показать матрицу
const showMatrix = (matrix, stocks, needs) => {
    for (let i = 0; i < matrix.length; i++) {
        const output = [];
        for (let j = 0; j < matrix[i].length; j++) {
            const element = matrix[i][j];

            if (typeof element == 'object') {
                sign = matrix[i][j].sign || '';
                output.push(setw(`${matrix[i][j].cost}[${matrix[i][j].use}]${sign}`, SETW_SIZE));
            } else {
                output.push(setw(matrix[i][j], SETW_SIZE));
            }
        }
        console.log(`${output} | ${stocks.length > 0 ? stocks[i] : ''}`);
    }
    console.log('—'.repeat(SETW_SIZE * matrix[0].length + 6));

    const needsOutput = [];
    for (let i = 0; i < needs.length; i++) {
        needsOutput.push(setw(needs[i], SETW_SIZE));
    }
    console.log(needsOutput + '\n');
}

// поиск минимального элемента в матрице
const findMin = (matrix, stocks, needs) => {
    let minI = 0;
    let minJ = 0;
    let minElement = Number.MAX_VALUE;

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] < minElement && stocks[i] != 0 && needs[j] != 0) {
                minElement = matrix[i][j];
                minI = i;
                minJ = j;
            }
        }
    }

    return {
        number: minElement,
        i: minI,
        j: minJ
    }
}

// распределение доходов
// (!) осторожно, мутирует входящие параметры
const distributionOfStocks = (matrix, stocks, needs, minElement) => {
    if (stocks[minElement.i] > needs[minElement.j]) {
        matrix[minElement.i][minElement.j].use = needs[minElement.j];
        stocks[minElement.i] = stocks[minElement.i] - needs[minElement.j];
        needs[minElement.j] = 0;
    } else {
        matrix[minElement.i][minElement.j].use = stocks[minElement.i];
        needs[minElement.j] = needs[minElement.j] - stocks[minElement.i];
        stocks[minElement.i] = 0;
    }
}

// проверка на нули в массиве
const isZero = (array) => {
    for (let i = 0; i < array.length; i++) {
        if (array[i] != 0) return false;
    }

    return true;
}

// метод наименьшей стоимости
const leastCostMethod = (matrix, stocks, needs) => {
    let methodNeeds = [...needs];
    let methodStocks = [...stocks];

    let methodMatrix = matrix.map(i => {
        return i.map(j => {
            return {
                cost: Number(j),
                use: 0
            }
        })
    })

    do {
        let min = findMin(methodMatrix.map(i => {
            return i.map(j => j.cost)
        }), methodStocks, methodNeeds);
        
        console.log(`\nМинимальный элемент = ${min.number}`)
        distributionOfStocks(methodMatrix, methodStocks, methodNeeds, min);
        showMatrix(methodMatrix, methodStocks, methodNeeds);
    } while (!isZero(methodNeeds) && !isZero(methodStocks));
    
    console.log('F(x) = ', findFX(methodMatrix));

    return methodMatrix;
}

const findFX = (matrix) => {
    let F = 0;
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j].use > 0) {
                F = F + (matrix[i][j].use * matrix[i][j].cost);
            }
        }
    }
    
    return F;
}

// улучшение опорного плана
// const improvementLeastCostMethod = (matrix) => {
//     // TODO: сделать цикл
//     let improvementMatrix = JSON.parse(JSON.stringify(matrix));
//     const {UArray, VArray} = findPotentials(improvementMatrix);
    
//     const checkOptimal = isOptimal(improvementMatrix, UArray, VArray);

//     if (!checkOptimal) {
//         console.log('Решение является оптимальным, поздравляю!');
//         showMatrix(improvementMatrix, UArray, VArray);
//         return;
//     }

//     console.log('Построим замкнутый цикл:');
//     console.log(`Максимальная свободная клетка - ${improvementMatrix[checkOptimal.i][checkOptimal.j].cost}\ni - ${checkOptimal.i}\nj - ${checkOptimal.j}`);
    
//     const loopedMatrix = makeClosedLoop(improvementMatrix, checkOptimal);
//     const loopedArrays = findPotentials(loopedMatrix);
//     const checkLoopedOptimal = isOptimal(loopedMatrix, loopedArrays.UArray, loopedArrays.VArray);

//     if (!checkLoopedOptimal) {
//         console.log('Решение является оптимальным, поздравляю!');
//         showMatrix(loopedMatrix, loopedArrays.UArray, loopedArrays.VArray);
//         console.log('F(x) = ', findFX(loopedMatrix));
//         return;
//     }
// }

const improvementLeastCostMethod = (matrix) => {
    let improvementMatrix = JSON.parse(JSON.stringify(matrix));
    
    // TODO: возможно стоит поменять логику цикла
    let isExit = false;
    do {
        let potentials = findPotentials(improvementMatrix);
        const checkOptimal = isOptimal(improvementMatrix, potentials.UArray, potentials.VArray);
    
        if (!checkOptimal) {
            console.log('Решение является оптимальным, поздравляю!');
            showMatrix(improvementMatrix, potentials.UArray, potentials.VArray);
            console.log('F(x) = ', findFX(improvementMatrix));
            isExit = true;
            return;
        }
    
        console.log('Построим замкнутый цикл:');
        console.log(`Максимальная свободная клетка - ${improvementMatrix[checkOptimal.i][checkOptimal.j].cost}\ni - ${checkOptimal.i}\nj - ${checkOptimal.j}`);
        
        improvementMatrix = makeClosedLoop(improvementMatrix, checkOptimal);
    } while (!isExit);

}

// создаём замкнутый цикл
// TODO: добавить провекрку на +/- в строке/столбце
const makeClosedLoop = (matrix, firstElement) => {
    let fixMatrix = JSON.parse(JSON.stringify(matrix));
    for (let i = 0; i < fixMatrix.length; i++) {
        for (let j = 0; j < fixMatrix[i].length; j++) {
            fixMatrix[i][j] = {...fixMatrix[i][j], pos: `${i}${j}`}
        }
    }

    const startI = firstElement.i;
    const startJ = firstElement.j;
    fixMatrix[startI][startJ] = {...fixMatrix[startI][startJ], sign: '+'}

    const startPoint = fixMatrix[startI][startJ];
    let usedCells;
    let isEnd = false;
    const fillLine = (line, element, isRow, path) => {
        if (isEnd) return;
        
        for (let i = 0; i < line.length; i++) {
            if (line[i] == startPoint) {
                isEnd = true;
                usedCells = [...path, element];
                return;
            }
        }

        let counter = 0;
        for (let i = 0; i < line.length; i++) {
            if (line[i].use > 0) {
                counter++;
            }
        }
        if (counter < 2) {
            return;
        }

        
        for (let i = 0; i < line.length; i++) {
            if (line[i].use > 0 && line[i] != element) {
                if (isRow) {
                    fillLine(fixMatrix.map(element =>  element[i]), line[i], false, [...path, element]);
                } else {
                    fillLine(fixMatrix[i], line[i], true, [...path, element]);
                }
            }
        }
    }

    // запускаем рекурсию
    for (let i = 0; i < fixMatrix[startI].length; i++) {
        if (fixMatrix[startI][i].use > 0 && fixMatrix[startI][i] != startPoint) {
            fillLine(fixMatrix.map(element =>  element[i]), fixMatrix[startI][i], false, []);
        }
    }

    // проставляем знаки '+' и '-'
    isPlus = false;
    for (let i = 0; i < fixMatrix.length; i++) {
        for (let j = 0; j < fixMatrix[i].length; j++) {
            if (usedCells.findIndex(usedCell => usedCell.pos == fixMatrix[i][j].pos) > -1) {
                fixMatrix[i][j].sign = isPlus ? '+' : '-';
                isPlus = !isPlus;
            }
        }
    }
    showMatrix(fixMatrix, [], []);

    //ищем минимальное значение среди чисел со знаком минус
    let min = {
        cost: 0,
        use: Number.MAX_VALUE,
        i: 0,
        j: 0
    }
    for (let i = 0; i < fixMatrix.length; i++) {
        for (let j = 0; j < fixMatrix[i].length; j++) {
            if (fixMatrix[i][j].sign === '-' && fixMatrix[i][j].use < min.use) {
                min = {
                    ...fixMatrix[i][j],
                    i,
                    j
                }
            }
        }
    }
    console.log(`Минимальное значение среди чисел со знаком минус - ${min.cost}[${min.use}]\ni - ${min.i}\nj - ${min.j}`);

    // вычитаем вышенайденное значение из чисел, имеющих знак '-'
    // и прибавляем к числам, имеющие знак '+'
    console.log("Вычтем этот элемент из элементов со знаком '-'\nи прибавим к элементам со знаком '+'")
    for (let i = 0; i < fixMatrix.length; i++) {
        for (let j = 0; j < fixMatrix[i].length; j++) {
            if (fixMatrix[i][j].sign === '-') {
                fixMatrix[i][j].use = fixMatrix[i][j].use - min.use;
            }

            if (fixMatrix[i][j].sign === '+') {
                fixMatrix[i][j].use = fixMatrix[i][j].use + min.use;
            }

            // убираем лишнее свойста из объекта
            fixMatrix[i][j] = {
                cost: fixMatrix[i][j].cost,
                use: fixMatrix[i][j].use
            }
        }
    }
    showMatrix(fixMatrix, [], []);
    return fixMatrix;
}

// находит потенциалы (U и V)
const findPotentials = (matrix) => {
    let potentialsMatrix = JSON.parse(JSON.stringify(matrix));

    // v потенциал (строка)
    const VArray = new Array(matrix[0].length);

    // u потенциал (столбец)
    const UArray = new Array(matrix.length);
    UArray[0] = 0;
    
    // занятные клетки
    const filledCells = [];
    for (let i = 0; i < potentialsMatrix.length; i++) {
        for (let j = 0; j < potentialsMatrix[i].length; j++) {
            if (potentialsMatrix[i][j].use > 0) {
                filledCells.push({
                    i,
                    j,
                    cost: potentialsMatrix[i][j].cost
                })
            }
        }
    }
    
    // заполняем V и U (решаем систему уравнений)
    do {
        for (let i = 0; i < filledCells.length; i++) {
            const cell = filledCells[i];
            
            if (typeof VArray[cell.j] != 'undefined' && typeof UArray[cell.i] == 'undefined') {
                console.log('cell', cell);
                UArray[cell.i] = cell.cost - VArray[cell.j];
                break;
            }
    
            if (typeof UArray[cell.i] != 'undefined' && typeof VArray[cell.j] == 'undefined') {
                console.log('cell', cell);
                VArray[cell.j] = cell.cost - UArray[cell.i];
                break;
            }
        }
        
        showMatrix(potentialsMatrix, UArray, VArray);
    } while (isUndefined(VArray) || isUndefined(UArray))

    return {
        VArray,
        UArray
    }
}

// проверка на undefined в массиве
const isUndefined = (array) => {
    for (let i = 0; i < array.length; i++) {
        if (typeof array[i] == 'undefined') return true;
    }

    return false;
}

// проверка матрицы на оптимальность
// находит дельта всех свободных элементов
// если матрица оптимальная - на выход даётся null
// если не оптимальная - элемент максимальной оценки
isOptimal = (matrix, UArray, VArray) => {
    const elements = [];

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j].use === 0 && VArray[j] + UArray[i] > matrix[i][j].cost) {
                elements.push({ i, j, number: VArray[j] + UArray[i] - matrix[i][j].cost})
            }
        }
    }

    if (elements.length > 0) {
        let minElement = elements[0];
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].number > minElement.number) {
                minElement = elements[i];
            }
        }
        return minElement;
    }

    return null;
}

const run = () => {
    console.log('Исходная матрица:')
    showMatrix(matrix, stocks, needs);

    console.log('Метод наименьшей стоимости:')
    const leastCostMatrix = leastCostMethod(matrix, stocks, needs);

    console.log('\nПроизведём улучшение опорного плана:')
    improvementLeastCostMethod(leastCostMatrix);
    
}

run();