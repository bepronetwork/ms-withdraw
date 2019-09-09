import chalk from 'chalk';

const TITLE_RENDER = chalk.bold.white;
const TEXT_RENDER = chalk.keyword('grey');
const WARNING_RENDER = chalk.keyword('orange');
const ERROR_RENDER = chalk.bold.red;
const SUCESS_TITLE_RENDER = chalk.bold.green;
const SUCESS_TEXT_RENDER = chalk.keyword('green');

const log = console.log;

export const Logger = {
    error : (text) => log(ERROR_RENDER(text)),
    warning : (text) => log(WARNING_RENDER(text)),
    info : (title, text) =>  log(`${TITLE_RENDER(title)} : ${TEXT_RENDER(text)}`),
    success : (title, text) =>  log(`\n${SUCESS_TITLE_RENDER(title)} : ${SUCESS_TEXT_RENDER(text)}`),
}




