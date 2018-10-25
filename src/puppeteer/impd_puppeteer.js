#!/usr/bin/env node

const _ = require("lodash");
const cli = require("commander");
const puppeteer = require("puppeteer");

cli.version("1")
    .option("--path <path>", "The output filepath")
    .action(function(required, optional) {})
    .parse(process.argv);


(async () => {
    let options = {};

    _.each(cli.options, function(option) {
        const option_name = option.name()
        _.set(options, option_name, cli[option_name]);
        console.log(option_name)
    });
    
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();

    
    const location = _.first(cli.args);
    await page.goto(location, {
        waitUntil: _.get(options, "waitUntil", "networkidle2")
    });
    await page.pdf(options);
    await browser.close();
})();
