#!/usr/bin/env node

const _ = require("lodash");
const cli = require("commander");
const puppeteer = require("puppeteer");

cli.version("1")
    .option("--path <path>", "The output filepath")
    .option("--auth_token <path>", "The authentication token for this user")
    .action(function(required, optional) {})
    .parse(process.argv);


(async () => {
    let options = {};
    options["path"] = cli["path"]
    
    // console.log(options)
    
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();

    page.setCookie({"name": "token",
                    "value": "84fb0bcf9c24e3396fb1ff13e14c3f936394a36e",
                    "domain": "localhost"})
    page.setCookie({"name": "user_id",
                    "value": "3",
                    "domain": "localhost"})

    const location = _.first(cli.args);
    await page.goto(location, {
        waitUntil: _.get(options, "waitUntil", "networkidle2")
    });
    await page.pdf(options);
    await browser.close();
})();
