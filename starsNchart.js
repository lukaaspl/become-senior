const drawStars = (
    node,
    starsNumber = 5,
    labelNode = false,
    stylePrefix = "_star"
) => {

    if (starsNumber < 1)
        return false;

    let star;

    // classes to aply when star is filled or not
    const starFilled = `fas fa-star ${stylePrefix}`;
    const starContour = `far fa-star ${stylePrefix}`;

    // drawing stars
    for (let i = 1; i <= starsNumber; i++) {
        star = document.createElement('i');
        star.className = starContour;
        star.dataset.rate = i;

        node.appendChild(star);
    }

    // creating container for label if needed
    if (labelNode) {
        labelNode = document.createElement('div');
        labelNode.classList.add(stylePrefix + '_label-container');

        node.after(labelNode);
    }

    // converting node list to array
    const nodeArr = [...node.childNodes];

    // filling stars after hovering
    const mouseOverStar = e => {
        for (let i = 0; i < starsNumber; i++) {
            if (i <= e.target.dataset.rate - 1)
                nodeArr[i].className = nodeArr[i].classList.contains('animated') ?
                    `${starFilled} animated` : starFilled;
            else if (nodeArr[i].dataset.active !== "true")
                nodeArr[i].className = starContour;
        }
    }

    // cleaning stars when mouse is out except active ones
    const mouseOutStar = () => {
        nodeArr.forEach(star => {
            if (star.dataset.active !== "true")
                star.className = starContour;
        });
    }

    // handling click event on star
    const clickOnStar = e => {
        setTimeout(() => infoBox.classList.remove('shown'), 1000);
        const clickedStarIndex = e.target.dataset.rate - 1;

        nodeArr.forEach((star, index) => {
            if (index <= clickedStarIndex) {
                star.dataset.active = true;

                // animate clicked star
                if (index === clickedStarIndex) {
                    nodeArr.forEach(star => star.removeEventListener('click', clickOnStar));
                    nodeArr[index].classList.add('animated');

                    // draws a label depending on the rating
                    (labelNode && getRateFromStars(index + 1, labelNode));

                    // own modifications
                    addRatePoints(node, index + 1);

                    setTimeout(() => {
                        nodeArr[index].classList.remove('animated');
                        nodeArr.forEach(star => star.addEventListener('click', clickOnStar));
                    }, 300);
                }
            }

            // if clicked star is located before one actived earlier, unactive the rest
            else {
                star.dataset.active = false;
                mouseOutStar();
            }
        });
    }

    // putting listeners on every star
    nodeArr.forEach(star => {
        star.addEventListener('mouseover', mouseOverStar);
        star.addEventListener('mouseout', mouseOutStar);
        star.addEventListener('click', clickOnStar);
    });
}

// displaying label function
const getRateFromStars = (starsNumber, labelNode) => {
    let label;

    switch (starsNumber) {
        case 1:
            label = 'Huh?';
            break;
        case 2:
            label = 'Know shit about it';
            break;
        case 3:
            label = 'Watched document on TV';
            break;
        case 4:
            label = 'I only think I know';
            break;
        case 5:
            label = 'Advanced level "Hello World"';
            break;
        default:
            label = "Are you trying to cheat?";
    }

    labelNode.innerHTML = label;
}

// adding/editing properties and their values to object
const addRatePoints = (node, starsNumber) => {
    const propertyName = node.className.split('_')[1];

    ratePoints[propertyName] = starsNumber;

    // if all stars are selected, show button
    if (Object.keys(ratePoints).length === starsContainers.length) {
        showResultBtn.classList.add('shown');
        showResultBtn.addEventListener('click', e => {
            e.target.disabled = "true";
            hideUI();
            showResult();
        });
    }
}

const hideUI = () => {
    skillsTable.classList.add('hidden');
    setTimeout(() => showResultBtn.classList.remove('shown'), 200);

    setTimeout(() => {
        showResultBtn.classList.add('unset');
        skillsTable.classList.add('unset')
    }, 1600);
}

const showResult = () => {
    const maxPoints = Object.keys(ratePoints).length * starsNumber;
    const chartLabels = ['HTML', 'CSS', 'JS', 'REACT', 'NODE', 'GIT'];
    const chartSeries = [];

    let pointsAchieved = 0;

    Object.values(ratePoints).forEach(value => {
        const currentRatio = (value * 100) / maxPoints;

        chartSeries.push(currentRatio);
        pointsAchieved += value;
    });

    const ratio = (pointsAchieved * 100) / maxPoints;

    // fill result containers with text
    const percentDiv = document.querySelector('.percent');
    const toGoDiv = document.querySelector('.to-go');
    let toGoLabel;

    switch (true) {
        case (ratio <= 20): toGoLabel = 'you are totally newbie.'; break;
        case (ratio > 20 && ratio <= 40): toGoLabel = 'still a long way to go.'; break;
        case (ratio > 40 && ratio <= 60): toGoLabel = 'can see the work you\'ve done! '; break;
        case (ratio > 60 && ratio <= 80): toGoLabel = 'it\'s really not bad!'; break;
        case (ratio > 80 && ratio <= 90): toGoLabel = 'you\'re a great developer! '; break;
        case (ratio > 90 && ratio < 99): toGoLabel = 'you remind me a bit of senior!'; break;
        default: toGoLabel = 'honestly, it\'s hard to say...';
    }

    percentDiv.style.animationPlayState = 'running';
    toGoDiv.style.animationPlayState = 'running';

    percentDiv.innerHTML = `${(ratio).toFixed()}%`;
    toGoDiv.innerHTML = `
    ${(100 - ratio).toFixed()}% to become a <strong>senior developer</strong>, ${toGoLabel}
    `;

    if (ratio < 100) {
        chartLabels.push(' ');
        chartSeries.push(100 - ratio);
    } else
        toGoDiv.innerHTML = `Congratulations! I officially appoints You as a <strong>SENIOR</strong>!`;


    setTimeout(() => drawChart(chartLabels, chartSeries), 1700);
}


const drawChart = (chartLabels, chartSeries) => {
    const chartData = {
        labels: chartLabels,
        series: chartSeries,
    };

    const chartSettings = {
        donut: true,
        showLabel: true,
    };

    document.querySelector('.ct-chart').style.display = "block";
    const chart = new Chartist.Pie('.ct-chart', chartData, chartSettings);

    chart.on('draw', data => {
        let pathLength;

        if (data.type === 'slice') {
            pathLength = data.element._node.getTotalLength();

            data.element.attr({
                'stroke-dasharray': `${pathLength}px ${pathLength}px`
            });


            const animationDefinition = {
                'stroke-dashoffset': {
                    id: `anim${data.index}`,
                    dur: 1000,
                    from: `${-pathLength}px`,
                    to: '0px',
                    easing: Chartist.Svg.Easing.easeOutQuint,
                    fill: 'freeze'
                }
            };

            if (data.index !== 0)
                animationDefinition['stroke-dashoffset'].begin = (
                    `anim${data.index - 1}.end`
                );

            data.element.attr({ 'stroke-dashoffset': `${-pathLength}px` });
            data.element.animate(animationDefinition, false);
        }
    });
}

// global object containing rate points
let ratePoints = {};

// example of use
const skillsTable = document.getElementById('skills');
const infoBox = document.querySelector('.infoBox');
const starsContainers = document.querySelectorAll('[class^="stars_"]');
const showResultBtn = document.getElementById('show-result');
const starsNumber = 5;

setTimeout(() => infoBox.classList.add('shown'), 1000);

for (container of starsContainers)
    drawStars(container, starsNumber, true);








// chart.on('created', () => {
//     if (window.__anim4329874) {
//         clearTimeout(window.__anim4329874);
//         window.__anim4329874 = null;
//     }

//     window.__anim4329874 = setTimeout(chart.update.bind(chart), 1000000);
// });