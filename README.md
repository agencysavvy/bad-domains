
![Image of agencysavvy](https://github.com/agencysavvy/bad-domains/blob/master/AS_343X43.png)


# bad-domains

## What the Script does:

1. The script will create a copy of the BADSTRINGS_SPREADSHEET spreadsheet for each account, read the list of bad strings (from the Settings tab) and identify the domains that contain those strings 

2. The list of domains identified and which will be added to the list will be appended to the “Bad Domains” Tab along with the related metrics and timestamp. 

3. The count of the number of domains found for each string is updated on the “Rollup Data” tab.  

4. If Campaigns with “ws:bd” label are found in the account the list will not be added to those campaigns 

5. Otherwise the ‘Excluded Placement List’ “WS BAD DOMAINS” will be created and added to the campaigns (this is what stops ads showing on those domains again)

## Installing and Setting the Script up

1. First you need to add account label(s) (in your MCC) to just the accounts you want the script to run on. You must use ‘ws:bd’ (case sensitive, without the quotes obviously) 

2. Add a label ‘ws:nobd’ to the campaigns (in those accounts)  which the script should ignore

3. Go to the Scripts editor at the MCC level (in Bulk Operations)

4. Create a new script

5. Copy the script from the baddomains.js

6. Name the script (eg “WebSavvy Bad Domains”) 

7. Save & Authorize now

8. Create a copy of this sheet (this is the MCC list of accounts) https://docs.google.com/spreadsheets/d/1R_oQl4B_JwVcix-9w8iu6ZXJq42D-0ZNwXBkvKjREZE/edit#gid=622870480  

Open it, go to ‘file’ then ‘make a copy’. Then copy the URL of YOUR ‘MCC’ sheet

9. Paste your sheet URL in the script next to the variable BADSTRINGS_MCC_SPREADSHEET

10. Create a copy of this sheet (this is the sheet created for each individual account) https://docs.google.com/spreadsheets/d/161nPkwcC2fe0hHEFh2a0yRzwOO7PK8Ey37zp5YIpx64/edit#gid=1810648742  

Open it, go to ‘file’ then ‘make a copy’. Then copy the URL of YOUR ‘account’ sheet
Also change the list of strings as required (you don’t have to use our list)

11. Paste your sheet URL in the script next to the variable BADSTRINGS_SPREADSHEET

12. Change the email in the script (variable RECIPIENT_EMAILS) to the email address that you want to use for notifications

13. If required, change the time duration (variables TIME_DURATION)

14. The default time duration is 60 days & only needs to be changed if you really want to!

15. Run the script for the first time. It will update the MCC Sheet with the list of Accounts that have the ws:bd Label and send you an email reminding you to add the label ws:bd to the campaigns you want the script to ignore

16. Run the script for a second time to create the various account sheets. (this is VERY important!)


## Test Mode

You shouldn’t need to change this, but we have a variable called TEST_MODE, that if set to “yes”, causes the spreadsheets to be created for labelled accounts (& show the data found) BUT does not create or add the Exclusion List to the account(s).

