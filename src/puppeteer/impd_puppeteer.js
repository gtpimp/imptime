#!/usr/bin/env node

const _ = require("lodash");
const program = require("commander");
const puppeteer = require("puppeteer");

program.version("1")
    .option("--path <path>", "The output filepath")
    .option("--auth-token <value>", "The authentication token for this user")
    .option("--user-id <value>", "The user id")
    .option("--mien-id <value>", "The mien to use for rendering")
    .option("--headerTemplate <value>", "The header template")
    .option("--footerTemplate <value>", "The footer template")
    .action(function(env, options) {})
    .parse(process.argv);

(async () => {
    let options = {};
    options["path"] = program["path"]
    options["headerTemplate"] = program["headerTemplate"]
    options["footerTemplate"] = program["footerTemplate"]
    options["displayHeaderFooter"] = true
    options["margin"] = { top: "100px", left: "10px", right: "10px", bottom: "50px" }
    
    user_id = "" + program['userId']
    auth_token = program['authToken']
    mien = program['mienId']

    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    const location = _.first(program.args);
    const domain = location.split("/")[2].split(":")[0]

    page.setCookie({"name": "token",
                    "value": auth_token,
                    "domain": domain})
    page.setCookie({"name": "user_id",
                    "value": user_id,
                    "domain": domain})
    page.setCookie({"name": "has_usable_password",
                    "value": "true",
                    "domain": domain})
    page.setCookie({"name": "current_mien",
                    "value": mien,
                    "domain": domain})

    await page.goto(location, {
        waitUntil: _.get(options, "waitUntil", "networkidle2")
    });
    await page.pdf(options);
    await browser.close();
})();
