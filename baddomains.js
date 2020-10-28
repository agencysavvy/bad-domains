// Copyright 2020, Websavvy. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/*
 * @name Bad Domains
 *
 * @overview Look for placements that match the bad domain strings,
 *       add them to the excluded placement list and apply the list 
 *       to all GDN campaigns.
 *
 * @author Websavvy Scripts Team [scripts@websavvy.com.au]
 *
 * @changelog
 * - version 1.0
 *   - Released initial version.
 *
 * @instructions
 * a copy of the instructions is also at https://docs.google.com/document/d/1ATAXyoCL-7Gv9P1pcU5itBf2P1fZMSOA7RsNokjhEdg/edit
 *
 *  step 1. First you need to add account label(s) (in your MCC) to just the accounts you want the script to run on. 
 *          You must use "ws:bd" (case sensitive, without the quotes obviously) 
 *
 *  step 2. Add a label "ws:nobd" to the campaigns (in those accounts) on which the script will ignore
 *
 *  step 3. Create a copy of this sheet (this is the MCC list of accounts) 
 *          https://docs.google.com/spreadsheets/d/1R_oQl4B_JwVcix-9w8iu6ZXJq42D-0ZNwXBkvKjREZE/edit#gid=622870480  
 *          Open it, go to "File" then "make a copy". Then copy the URL of YOUR ‘MCC’ sheet
 *
 *  step 4. paste the new URL just below in variable BADSTRINGS_MCC_SPREADSHEET 
 */
var BADSTRINGS_MCC_SPREADSHEET = "PASTE THE URL HERE";

/* step 5.  Create a copy of this sheet (this is the sheet created for each individual account) 
 *          https://docs.google.com/spreadsheets/d/161nPkwcC2fe0hHEFh2a0yRzwOO7PK8Ey37zp5YIpx64/edit#gid=1810648742   
 *          Open it, go to "File" then "make a copy". Then copy the URL of YOUR "Account" sheet
 *          Also change the list of strings as required on the settings tab (you don’t have to use our list)
 *
 *  step 6. paste the new URL below in variable BADSTRINGS_SPREADSHEET 
 */

var BADSTRINGS_SPREADSHEET = "PASTE THE URL HERE";

/*
 *  step 7. Change email below (variable RECIPIENT_EMAILS) with the email address where you would like to get notifications
 */

var RECIPIENT_EMAILS = ["example1@websavvy.com.au"];

/*  
 *  step 8. (optional) Change the time duration (variables TIME_DURATION ) if required.The default time duration is 60 days
 */

var TIME_DURATION = 60;

/*  step 9. run the script again - it will now create your Bad domains lists for each account and output to each account spreadsheet
 *  
 *  step 10. schedule the script to run daily (e.g. at 2am your time)
 */


// Do not Change anything below this -------------------------------------------------


var CONFIG = {
    TEST_MODE: "NO",
    ACCOUNT_LABEL: "ws:bd",
    CAMPAIGN_EXCLUSION_LABEL: "ws:nobd",
    EXCLUDED_PLACEMENT_LIST_NAME: "WS BAD DOMAINS",
}

var ID_PATTERN = /^\d{3}-\d{3}-\d{4}$/;
var DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

var SETTINGS = {
    // Sheet names - do not change
    ACCOUNTS_SHEET_NAME: 'Accounts Lookup',
    SETTINGS_SHEET_NAME: 'Settings',
    camp: [
        "Domain",
        "TimeStamp",
        "Impressions",
        "Interactions",
        "Cost",
        "Ctr",
        "AverageCpc",
        "Conversions",
        "ConversionRate",
        "CostPerConversion",
        "ConversionValue",
        "AllConversions",
        "AllConversionValue",
        "ViewThroughConversions",

    ]
}
/******************
  Main method
 *******************/
function main() {

    var accountData = getAccountData();
    var accountDetails = {};
    var ids = accountData.ids;
    var newIds = checkSettings(ids);
    var accountSelector = AdsManagerApp.accounts().withIds(ids);
    if (accountSelector.get().totalNumEntities() >= 50) {
        var accountIterator = accountSelector.get();
        var jobIdMap = {};
        while (accountIterator.hasNext()) {
            // Get the current account.
            var account = accountIterator.next();

            // Select the child account.
            AdsManagerApp.select(account);

            // Run reports against child account.
            accountDetails[account.getCustomerId()] = JSON.parse(processAccount(JSON.stringify(accountData)));
        }


        if (newIds.length > 0) {
            for (var i = 0; i < newIds.length; i++) {
                accountDetails[newIds[i][0]] = {
                    id: newIds[i]
                };
            }
        }
        if (Object.keys(accountDetails).length > 0) {
            createLinks(accountDetails);
        }

    } else {
        accountSelector.executeInParallel('processAccount', 'afterCallback', JSON.stringify(accountData))

    }

}
/********************************************
Pull account data from the MCC Settings Sheet
*********************************************/
function getAccountData() {
    var sheet = SpreadsheetApp.openByUrl(BADSTRINGS_MCC_SPREADSHEET).getSheetByName(SETTINGS.ACCOUNTS_SHEET_NAME);

    var accountData = {};
    accountData.ids = [], acc = {};
    try {
        var range = sheet.getRange("A3:F")
    } catch (e) {
        throw new Error(args[1] + ' is not a valid range');
    }
    //Get the hyperlinks
    var formulas = range.getFormulas();
    formulas = formulas
        .filter(function(row) {
            return row[0] && row[0] !== "";
        })
        .map(function(row) {

            if (row[0].indexOf(",") != -1) {
                var id = row[0].split(",")[1].replace(/"/g, '');
                id = id.substring(0, id.length - 1);

                acc[id] = row[0].match(/=hyperlink\("([^"]+)"/i)[1];
            } else {
                var id = row[0].split('"')[1].replace(/"/g, '');
                id = id.substring(0, id.length - 1);
                acc[id] = "";
            }
        });
    var data = range.getValues();

    sheet.getRange("A3:H").getValues()
        //Filter invalid rows
        .filter(function(row) {
            return row[0];

        })
        //Construct account data
        .map(function(row) {
            var value = (acc[row[0]]) ? acc[row[0]] : "";
            //construct details dict for each account
            accountData.ids.push(row[0]);
            accountData[row[0]] = {
                id: row[0],
                name: row[1],
                spreadsheet: value
            }


        });



    return accountData;
}
/**********************************************
Check if the Label was added to any New account
and Add the account details to the Settings Tab.
Also send a notification email
***********************************************/
function checkSettings(ids) {

    var missingIds = [];
    var accountIterator = AdsManagerApp.accounts().withCondition('LabelNames CONTAINS "' + CONFIG.ACCOUNT_LABEL + '"').get();
    while (accountIterator.hasNext()) {
        var account = accountIterator.next();
        var customerId = account.getCustomerId();

        if (ids.indexOf(customerId) === -1) {
            missingIds.push([customerId, account.getName()]);

        }

    }
    if (missingIds.length > 0) {

        var subject = 'New Accounts Added to the Bad Domains Dashboard ' + new Date();
        var list = [];
        list.push('Hey,\n>');
        list.push('The following new accounts will be added to the list of accounts on which the script is run the next time :\n>');
        for (var i = 0; i < missingIds.length; i++) {
            list.push((i + 1) + '.' + missingIds[i][1] + '\n');
            SpreadsheetApp.openByUrl(BADSTRINGS_MCC_SPREADSHEET).getSheetByName(SETTINGS.ACCOUNTS_SHEET_NAME).appendRow(missingIds[i]);
        }
       
        list.push('If you <strong>do not want</strong> the List to be added to any campaign ,add the Label "ws:bd" to the campaigns\n>');
        list.push('You can access the accounts from ' + BADSTRINGS_MCC_SPREADSHEET);
        if (RECIPIENT_EMAILS != "") MailApp.sendEmail(RECIPIENT_EMAILS, subject, list.join('\n'));
    }

    return missingIds;
}
/*****************************************
Get the Account Spreadsheet. If not existing
create a new one
******************************************/
function getReportSpreadSheet(accountDetails, templateSheet) {
    var reportSpreadSheet = null;
    var url = accountDetails.spreadsheet;

    if (url) {
        reportSpreadSheet = SpreadsheetApp.openByUrl(url);
    } else {
        reportSpreadSheet = templateSheet.copy("Bad Domains - " + accountDetails.name);
        reportSpreadSheet.addEditors(RECIPIENT_EMAILS);

    }
    return reportSpreadSheet;
}
/**********************************************
 Function that runs on all accounts that calls other 
 methods do find and exclude badstrings
  *********************************************/
function processAccount(details) {
    var account = AdsApp.currentAccount();

    var accountDetails = JSON.parse(details);
    accountDetails = accountDetails[account.getCustomerId()];

    AdsManagerApp.select(account);

    Logger.log('Processing Account %s, %s', account.getCustomerId(), account.getName());


    var templateSheet = SpreadsheetApp.openByUrl(BADSTRINGS_SPREADSHEET);
    var spreadsheet = getReportSpreadSheet(accountDetails, templateSheet);
    var excludeValues = [];
    var today = Utilities.formatDate(new Date(), 'Australia/Sydney', 'yyyy-MM-dd')

    var spreadsheetData = getReportSpreadSheet(account, templateSheet);
    var accountData = {
        id: account.getCustomerId(),
        name: account.getName(),
        spreadsheet: spreadsheet,
    };

    var flag = spreadsheetData.flag;
    var excludeValues = (spreadsheet.getSheetByName(SETTINGS.SETTINGS_SHEET_NAME).getRange("A3:A").getValues()).map(function(obj) {
        if (obj[0] && obj[0] != "") return obj[0];
    });
    excludeValues = removeDups(excludeValues);

    accountData["timezone"] = account.getTimeZone();
    accountData["excludeValues"] = excludeValues;


    accountData = findEcxludedDomains(account, accountData);

    if (accountData['domainArray'].length > 0) {
        updateSheet(accountData);

    }
    accountData["spLink"] = spreadsheet.getUrl();

    return JSON.stringify(accountData);
}
/**********************************************
  Function that get the placementdata from google ads and
  exclude all placements that match the badstrings.
  Then if any new placements that are excluded create 
  an array with that data
  *********************************************/
function findEcxludedDomains(account, accountData) {

    AdsManagerApp.select(account);
    var excludeValues = accountData.excludeValues;
    var placementArray = [];
    var accountArray = [];
    var from = (TIME_DURATION) ? getDateInThePast((TIME_DURATION * 1.0) + 1) : 61;
    var yesterday = getDateInThePast(1);
    var duration = [from, yesterday];

    var statColumns = SETTINGS['camp'];
    statColumns.splice(1, 1);

    var reportIterator = AdsApp.report('Select ' + statColumns.join(",") + ',IsPathExcluded from AUTOMATIC_PLACEMENTS_PERFORMANCE_REPORT where AdNetworkType1="CONTENT" AND Impressions >0 during ' + duration).rows();
    while (reportIterator.hasNext()) {
        var row = reportIterator.next();
        var placement = {
            Excluded: row['IsPathExcluded']

        };
        for (var i = 0; i < statColumns.length; i++) {
            var dataRow;
            (row[statColumns[i]]) ? dataRow = row[statColumns[i]].replace(/,/g, ""): 0;
            dataRow = dataRow.replace(/>/g, "");
            dataRow = dataRow.replace(/</g, "");
            dataRow = dataRow.replace(/%/g, "");
            placement[statColumns[i]] = (row[statColumns[i]]) ? (dataRow) : 0;

        }
        placementArray.push(placement);
    }
    //Check if the list already exists and get the list of domains
    var placementsList = [];
    var excludedPlacementListIterator =
        AdsApp.excludedPlacementLists()
        .withCondition("Name = '" + CONFIG.EXCLUDED_PLACEMENT_LIST_NAME + "'")
        .get();
    while (excludedPlacementListIterator.hasNext()) {
        var placementIt = excludedPlacementListIterator.next();
        var placementSel = placementIt.excludedPlacements().get();
        while (placementSel.hasNext()) {
            var placement = placementSel.next();
            placementsList.push(placement.getUrl());

        }
    }

    placementArray = placementArray.filter(function(obj) {
        return obj.Excluded == "false";
    })


    var excludeDomains = [],
        badStrings = {},
        spArray = [];;
    for (var i = 0; i < excludeValues.length; i++) {
        var value = excludeValues[i];
        var chosen = placementArray.filter(function(obj) {
            return (obj.Domain).indexOf(value) > -1;
        })

        var domains = chosen.map(function(obj) {
            return obj.Domain;
        });
        domains = removeDups(domains);


        if (placementsList.length > 0) {
            domains = domains.filter(function(obj) {
                return placementsList.indexOf(obj) == -1
            });
        }

        excludeDomains = excludeDomains.concat(domains);
        if (domains.length > 0) {
            badStrings[value] = domains.length
        };
        spArray = spArray.concat(chosen);
    }

    var finalArray = getRollupData(spArray);
    excludeDomains = removeDups(excludeDomains);
    //Get the GDN Campaigns to add the list to 
    var camp = getGDNCampaigns();
    if (excludeDomains.length > 0 && (CONFIG.TEST_MODE).toLowerCase() == "no" && camp.length > 0) {
        exclude(account, excludeDomains, camp)
    }


    accountData['badStrings'] = badStrings;
    accountData['domainArray'] = finalArray;

    return accountData;


}
/*****************************************
Function to Calcluate the metric for each placement
******************************************/
function getRollupData(spArray) {
    var pArray = [];
    var domains = spArray.map(function(obj) {
        return obj.Domain;
    });
    domains = removeDups(domains);

    for (var d = 0; d < domains.length; d++) {
        var domain = domains[d];

        var domainData = spArray.filter(function(obj) {
            return obj.Domain == domain;
        });
        if (domainData.length > 1) {
            pArray.push(calculatebasicMetrics(domainData));
        } else {
            pArray.push(domainData[0]);
        }

    }
    return pArray;

}
/*****************************************
   Function to Calcluate the metric for each placement
******************************************/
function calculatebasicMetrics(domainData) {
    var temp = JSON.parse(JSON.stringify(domainData));
    var calcArray = JSON.parse(JSON.stringify(domainData))[0];

    calcArray.Impressions = temp.sum("Impressions");
    calcArray.Cost = (temp.sum("Cost") * 1.00).toFixed(2);
    calcArray.Conversions = temp.sum("Conversions");
    calcArray.Interactions = temp.sum("Interactions");
    calcArray.ConversionValue = temp.sum("ConversionValue");
    calcArray.AllConversions = temp.sum("AllConversions");
    calcArray.ViewThroughConversions = temp.sum("ViewThroughConversions");
    calcArray.AllConversionValue = temp.sum("AllConversionValue");
    calcArray.Ctr = (calcArray.Interactions > 0 && calcArray.Impressions > 0) ? (parseFloat(calcArray.Interactions / calcArray.Impressions) * 100 * 1.0).toFixed(1) : 0 * 1.0;
    calcArray.AverageCpc = (calcArray.Cost > 0 && calcArray.Interactions > 0) ? (parseFloat(calcArray.Cost * 1.00 / calcArray.Interactions)).toFixed(2) : 0 * 1.00;
    calcArray.CostPerConversion = (calcArray.Cost > 0 && calcArray.Conversions > 0) ? (parseFloat(calcArray.Cost / calcArray.Conversions)).toFixed(2) : 0 * 1.00;
    calcArray.ConversionRate = (calcArray.Conversions > 0 && calcArray.Interactions > 0) ? (parseFloat(calcArray.Conversions / calcArray.Interactions) * 100 * 1.00).toFixed(2) : 0 * 1.00;

    return calcArray;

}

/*****************************************
Update the Account spreadsheet
******************************************/
function updateSheet(accountData) {

    var spreadsheet = accountData.spreadsheet;
    var access = new SpreadsheetAccess(spreadsheet.getUrl(), "Bad Domains");
    var emptyRow = access.findEmptyRow(2, 1);

    var accArray = accountData['domainArray'];
    var headers = [
        "Domain",
        "TimeStamp",
        "Impressions",
        "Interactions",
        "Cost",
        "Ctr",
        "AverageCpc",
        "Conversions",
        "ConversionRate",
        "CostPerConversion",
        "ConversionValue",
        "AllConversions",
        "AllConversionValue",
        "ViewThroughConversions",
    ];
    var today = Utilities.formatDate(new Date(), 'Australia/Sydney', 'yyyy-MM-dd')
    var spArray = [];
    var startingRow = 2;

    for (var i = 0; i < accArray.length; i++) {
        var row = accArray[i];
        var sRow = [];
        for (var j = 0; j < headers.length; j++) {

            var col = headers[j];
            var colRow = row[col];
            if (col == "Cost" || col == "AverageCpc" || col == "CostPerConversion" || col == "ConversionValue" || col == "AllConversionValue") {
                colRow = "$" + (colRow);

            }
            if (col == "Ctr" || col == "ConversionRate") {

                colRow = colRow + "%";
            }

            if (j === 1) {
                sRow.push(today);
            } else {
                sRow.push(colRow);
            }
        }

        spArray.push(sRow);
        startingRow++;
    }
    access.writeRows(spArray, emptyRow, 1);
    var keys = Object.keys(accountData['badStrings']),
        accArray = [];
    if (keys.length > 0) {
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            accArray.push([key, today, accountData['badStrings'][key]]);
        }
        var accessB = new SpreadsheetAccess(spreadsheet.getUrl(), "Rollup Data");
        var emptyRow = accessB.findEmptyRow(2, 1);

        accessB.writeRows(accArray, emptyRow, 1);
    }

}
/*****************************************
Function to create the placement lists and 
add them to the campaigns
******************************************/
function exclude(account, domains, camp) {
    AdsManagerApp.select(account);
    var placementListName = CONFIG.EXCLUDED_PLACEMENT_LIST_NAME;

    var placmentArray = [];
    if (camp.length > 0) {
        /** If a List with the same name exists add append the new domains it.
            If there is no List ,create a new one **/

        var campaignIterator = AdsApp
            .campaigns()
            .withIds([camp]).get();
        while (campaignIterator.hasNext()) {
            var campaign = campaignIterator.next();
            var excludedPlacementListSelector =
                AdsApp.excludedPlacementLists()
                .withCondition("Name = '" + placementListName + "'");

            if (excludedPlacementListSelector.get().totalNumEntities() == 1) {
                var excludedPlacementListIterator = excludedPlacementListSelector.get();
                while (excludedPlacementListIterator.hasNext()) {
                    var excludedPlacementList = excludedPlacementListIterator.next();
                    excludedPlacementList.addExcludedPlacements(domains);

                    campaign.addExcludedPlacementList(excludedPlacementList);
                }
            } else {

                var excludedPlacementListOperation =
                    AdsApp.newExcludedPlacementListBuilder()
                    .withName(placementListName)
                    .build();
                var newExcludedPlacementList = excludedPlacementListOperation.getResult();

                if (newExcludedPlacementList) {

                    newExcludedPlacementList.addExcludedPlacements(domains);

                    campaign.addExcludedPlacementList(newExcludedPlacementList);
                }
            }
        }
    }

}
/*****************************************
 Function to Find the Campaigns on which to 
 apply the excluded placement
 *****************************************/
function getGDNCampaigns() {
    var account = AdsApp.currentAccount();
    AdsManagerApp.select(account);
    var camps = [];

    var reportIterator = AdsApp.report('select CampaignId,Labels from CAMPAIGN_PERFORMANCE_REPORT where CampaignStatus="ENABLED" AND AdvertisingChannelType="DISPLAY" during TODAY').rows();
    while (reportIterator.hasNext()) {
        var report = reportIterator.next();
        var label = (report['Labels'] && report['Labels'] !== "--") ? JSON.parse(report['Labels']) : "--";

        if (label.indexOf(CONFIG.CAMPAIGN_EXCLUSION_LABEL) == -1) {
            camps.push(report['CampaignId']);
        }
    }
    return camps;
}



/*****************************************
    Call Function when account processing 
    is done in parallel
    *****************************************/
function afterCallback(results) {
    var emailData = [],
        accountData = {};
    for (var i = 0; i < results.length; i++) {
        // Get the ExecutionResult for an account.
        var result = results[i];

        Logger.log('Customer ID: %s; status = %s.', result.getCustomerId(),
            result.getStatus());

        // Check the execution status. This can be one of ERROR, OK, or TIMEOUT.
        if (result.getStatus() == 'ERROR') {
            Logger.log("-- Failed with error: '%s'.", result.getError());
            emailData.push([result.getCustomerId(), result.getError()]);
        } else if (result.getStatus() == 'OK') {
            // This is the value you returned from processAccount method. If you
            // used JSON.stringify(value) in processAccount, you can use
            // JSON.parse(text) to reconstruct the JavaScript object.
            var retval = JSON.parse(result.getReturnValue());
            accountData[result.getCustomerId()] = retval;
        }
    }
    if (Object.keys(accountData).length > 0) {
        createLinks(accountData);
    }
    if (emailData.length > 0) {
        sendEmail(emailData);

    }



}
/************************************************************************
Function to create links on the MCC Account Sheet
***********************************************************************/
function createLinks(accountData) {

    var dashboard = SpreadsheetApp.openByUrl(BADSTRINGS_MCC_SPREADSHEET);

    var settingsSheet = dashboard.getSheetByName(SETTINGS.ACCOUNTS_SHEET_NAME);
    var dashboardSheet = dashboard.getSheetByName(SETTINGS.ACCOUNTS_SHEET_NAME);

    var dashboardData = dashboardSheet.getRange("A2:H").getValues().filter(function(value) {
        //Filter Empty rows
        return value[0] && value[0].match(ID_PATTERN);
    });

    var linkFormulas = [];
    for (var i = 0; i < dashboardData.length; i++) {
        var dashboardRow = dashboardData[i];
        var id = dashboardRow[0]
        var lookupRow = accountData[id];
        var formula = '';
        var count = 0;
        var total = 0;

        var hyperlink = lookupRow && lookupRow.spLink && lookupRow.spLink !== "" ? lookupRow.spLink : '';
        if (hyperlink) {

            //Link the account name on dashboard with campaign anomaly detail page
            formula = '=HYPERLINK("' + hyperlink + '","' + dashboardRow[0] + '")';
            linkFormulas.push([formula]);

        } else {
            //Link the account name on dashboard with campaign anomaly detail page
            formula = '=("' + dashboardRow[0] + '")';
            linkFormulas.push([formula]);


        }
    }

    var linksRange = dashboardSheet.getRange(2, 1, linkFormulas.length, 1);
    linksRange.setFormulas(linkFormulas);

}
Array.prototype.sum = function(prop) {
    var total = 0
    for (var i = 0, _len = this.length; i < _len; i++) {
        total += (this[i][prop]) * 1.0
    }
    return total
}
Array.prototype.clone = function() {
    return this.slice(0, this.length);
};
/*****************************************
    Function to Send Error Emails
    *****************************************/
function sendEmail(accounts) {
    if (accounts.length > 0) {
        var footerStyle = 'color: #aaaaaa; font-style: italic;';
        var subject = 'Error :Bad Domains script' + new Date();
        var list = [];
        list.push('Hey \n>');
        list.push('Bad Domains has the following errors:\n>');
        for (var i = 0; i < accounts.length; i++) {
            list.push((i + 1) + '.' + accounts[i][0] + '  : Error is :  ' + accounts[i][1] + '\n');

        }

        MailApp.sendEmail(EMAIL, 'Error :Bad Domains script', list.join('\n'));
    }
}
Array.prototype.clean = function(deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};
Array.max = function(array) {
    return Math.max.apply(Math, array);
};
Array.prototype.unique = function() {
    var o = {},
        i, l = this.length,
        r = [];
    for (i = 0; i < l; i += 1) o[this[i]] = this[i];
    for (i in o) r.push(o[i]);
    return r;
};

function removeCommas(str) {
    return parseFloat(str.replace(/,/g, '')).toFixed(2);
};

function getDateInThePast(numDays) {
    var today = new Date();
    today.setDate(today.getDate() - numDays);
    return Utilities.formatDate(today, AdsApp.currentAccount().getTimeZone(), 'yyyyMMdd');
}

function days_between(date1, date2) {

    // The number of milliseconds in one day
    var ONE_DAY = 1000 * 60 * 60 * 24

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime()
    var date2_ms = date2.getTime()

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms)

    // Convert back to days and return
    return Math.round(difference_ms / ONE_DAY)

}

function SpreadsheetAccess(spreadsheetUrl, sheetName) {

    this.spreadsheet = SpreadsheetApp.openByUrl(spreadsheetUrl);
    this.sheet = this.spreadsheet.getSheetByName(sheetName);
    if (!this.sheet) {
        this.sheet = this.spreadsheet.insertSheet(sheetName);
    }
    this.findEmptyRow = function(minRow, column) {
        var values = this.sheet.getRange(minRow, column,
            this.sheet.getMaxRows(), 1).getValues();
        for (var i = 0; i < values.length; i++) {
            if (!values[i][0]) {
                return i + minRow;
            }
        }
        return -1;
    };
    this.addRows = function(howMany) {
        this.sheet.insertRowsAfter(this.sheet.getMaxRows(), howMany);
    };
    this.writeRows = function(rows, startRow, startColumn) {
        this.sheet.getRange(startRow, startColumn, rows.length, rows[0].length).
        setValues(rows);
    };
}

function removeDups(arra) {
    arra = arra.unique();
    arra = arra.clean(null);
    arra = arra.clean(undefined);
    return arra;

}
