const puppeteer = require('puppeteer'); //npm install puppeteer
const {
    blue,
    cyan,
    green,
    magenta,
    red,
    yellow
} = require('colorette') //npm install colorette - расскрашивать текст в console.log например console.log(green('success!'))
const http = require('http');
const fse = require('fs-extra') //   npm install fs-extra без этого не создается папка

var today = new Date(); //объявляем дату в today
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //Январь это 0
var yyyy = today.getFullYear();

today = dd + '.' +  mm + '.' + yyyy;

const dir = 'results/' + today; //объявляем dir
const desiredMode = 0o2775 //хз
const options = {
    mode: 0o2775
}

const file = `${dir}/test.txt`;

function delay(time) { //функуция задержки, задержка это плохо, но не для нас
    return new Promise(function(resolve) {
        setTimeout(resolve, time)
    });
}

async function testLimex() {
	console.log(green('today is ' + today));
	
    const browser = await puppeteer.launch({
        agrs: ['--no-sandbox', '--window-size=1920,1080', '--ignore-certificate-errors', '--ignore-certificate-errors-spki-list'],
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: true,
        ignoreHTTPSErrors: false,
        defaultViewport: {
            height: 1920,
            width: 1080,
            isMobile: false,
            hasTouch: false,
            isLandscape: false,
            slowMo: 250
        },
        devtools: false,
        dumpio: true //показывать ошибки консоли, как-то не ок работает
    });

    try {
        await fse.ensureDir('results/' + today) //пытается создать папку с датой (сегодня), если она еще не создана
        console.log(green('success dir created or already created!'))
    } catch (err) {
        console.error(err)
    }
	
	//async function example (f) {
	try {
		await fse.ensureFile(file)
		console.log(green('success file created or already created!'))
	} catch (err) {
		console.error(err)
	}
	//}

    const page1 = await browser.newPage();

    await page1.goto('https://limex.tv');
    console.log(green('Open limex.tv'));

    await delay(10000); //ждём когда появится сообщение о куках
    try {
        await page1.click('#__layout > div > div > div.cookie__popup-container > div > span.cookie__icon-close') //попытка закрыть попап о куках
        console.log(green('Pupup with cookies closed'))
    } catch (err) {
        console.error(err)
    }

    await autoScroll(page1); //скролим страницу до конца, чтобы загрузились все дивы

    let i = 0; //обявляем i=0 чтобы использовать его в li:nth-child подставляя каждый раз значение i++. Тем самым перебираем все каналы по очереди, используя селектор с child(number)
    do {
        i++;
        try {
            let pageTest = await page1.$eval('#__layout > div > div > div > ul > li:nth-child(' + i + ') > div > a > div > div.channel__item-wrapper > div.channel__name-container > div.channel__title-container', el => el.innerText);
            console.log(magenta('About channel ' + pageTest + ':')); //находим название канала по селектору, забираем текст из него и объявляем как pageTest используем далее для сохранения названия скриншота

            await page1.waitForSelector('#__layout > div > div > div > ul > li:nth-child(' + i + ') > div > a > div > div.channel__item-wrapper > div.channel__name-container > div.channel__title-container'); // ждём загрузки нашего объекта,  можно и без него наверное, ведь мы уже ждали когда прокручивали сайт загружая все дивы
            await page1.focus('#__layout > div > div > div > ul > li:nth-child(' + i + ') > div > a > div > div.channel__item-wrapper > div.channel__name-container > div.channel__title-container');
            const link = await page1.$('#__layout > div > div > div > ul > li:nth-child(' + i + ') > div > a > div > div.channel__item-wrapper > div.channel__name-container > div.channel__title-container'); // объявляем наш канал, далее используем чтобы открыть его в новом окне

            const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))); // объявляем обещание, всё будет хорошо, обещаю

            await link.click({button: 'middle'}); // нажимаем средней кнопкой, чтобы открыть в новое окно
            const page2 = await newPagePromise; // объявляем новое окно
            await page2.bringToFront();

            await delay(8000); //сколько времени даем на загрузку трансляции
            await page2.on('console', msg => console.log);

            await page2.setViewport({ //чтобы все было в скрине, без этого часть плеера обрезается
                width: 1920,
                height: 1080,
                fullPage: true
            });
            const element = await page2.$('#__layout > div > div > div > section > div'); //объявляем див с плеером для скриншота элемента

            await element.screenshot({
                path: `${dir}/${pageTest}.jpeg`,
                type: 'jpeg'
            }); //делаем скрин и сохраняем его в 'results/' + today с названием канала 

            console.log(green('Screenshot saved ' + pageTest + ', ' + i + ' of 304 success!')); //рассказываем всем, что мы сделали скриншот
            await page2.close(); //закрываем окно
            await delay(200);
			} catch 
	{
		console.error('cannot access' + pageTest);
	}
		} while (i < 304); //повторяем столько-то раз, можно изменить чисто в зависимости от кол-ва каналов
    console.log('Almost DONE!!!');
    await browser.close(); //закрываем браузер
	await delay(2000);
	return testLimex();
}
testLimex();

async function autoScroll(page) { //функция для скролла page1
    await page.evaluate(async() => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 400; //сколько пикселей прокрутится за 1 раз, чем больше значение тем быстрее прокручивается page1
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}