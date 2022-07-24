# LimexAQA
Для запуска скрипта понадобится:
Node.js https://nodejs.org/en/download/
проверить установлен ли node (прописываем в терминале):
node -v
Библиотека puppeteer и другие (прописываем в терминале):
nmp install puppeteer
nmp install colorette
npm install fs-extra

открываем limex.js любым текстовым редактором
проверяем executablePath — это путь до нашего хрома, можно комментировать строку, тогда будет использоваться хромиум.

Затем переходим в папку с файлом limex.js (в терминале) и запускаем скрипт командой:
bode limex.js

результаты тестирования (снимки экрана) будут сохранены в директории node\results\${today date}
