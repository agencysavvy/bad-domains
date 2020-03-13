
![Image of agencysavvy](https://github.com/agencysavvy/bad-domains/blob/master/AS_343X43.png)


# Bad Domains 

### Video Instructions

https://www.loom.com/share/313d33fbd2184f06974dc614f353523c

## WHAT

The goal of this script is to identify and exclude domains based on strings you've defined as "bad" (such as .tk, asbestos, .rt etc.)


It helps you automatically exclude these bad domains from your Google Display campaigns and reports back on what's been excluded.

It is applied at an MCC level and generates a bad domains dashboard with exclusion reports for the individual accounts you’ve chosen to run the script on




## WHY

So that you stop display ads from showing on domains that are not appropriate for the brand or known to be poor-performing.


And you save hours of manual work reviewing your auto placement reports weekly as the individual placements for these domains quite often pass under the radar as they may have low impressions or low cost. 
But when you add them up and look at the roll up report, you may find a decent amount of budget and irrelevant ad impressions have been saved.




## HOW IT WORKS

The script relies on spreadsheets and labels to run.

You’ll have to add labels to the accounts that you want the script to run on. And if you don’t wish to run the script on certain campaigns within these accounts, you can add a label for the script to ignore them.
 
If there are no labels, the account gets ignored.


### Labels used

**ws:bd** - to be applied at account level so that you can choose which accounts you'd like the script to run on

**ws:nobd (optional)** - to be applied at campaign level if you'd like to opt certain campaigns out. By default the script will run & add exclusions to all display campaigns (except smart display) in the account.

### Spreadsheets used

**BADSTRINGS_MCC_SPREADSHEET**- This is a MCC level spreadsheet that automatically list the CIDs and client names with the ws:bd label that the script has run on. 

The CID column is hyperlinked to the individual client sheet as seen here " https://www.screencast.com/t/TT7UP30prYS


**BADSTRINGS_SPREADSHEET** - As mentioned above, each account has it's own unique spreadsheet with the bad domains data with 3 tabs.

The first is **"settings"**- where you get to list the bad strings that you'd like the script to find.

The second is **"Bad Domains"** - which is the full list of bad domains the script has found and excluded along with their performance metrics & timestamp of when it was found.

The third is **"Rollup Data"** - which gives a roll up report with a count of the number of domains found and excluded per string along with a timestamp when it ran.





## INSTRUCTIONS ON INSTALLING THE SCRIPT

1. You get total control over which accounts the script runs on.
   First you need to add label(s) (in your MCC) to just the accounts you want the script to run on. You must use ‘ws:bd’ (case sensitive, without the quotes obviously)

2. And which campaigns: Add a label ‘ws:nobd’ to the campaigns (in those accounts) which the script should ignore (so you can easily opt    out campaigns, eg for remarketing campaigns)

3. Go to the Scripts editor at the MCC level (in Bulk Operations)

4. Create a new script

5. Copy the script exactly from the baddomains.js in github

6. Name the script (eg “WebSavvy Bad Domains”) 

7. Save & Authorize now




## INSTRUCTIONS ON SETTING UP THE SPREADSHEETS & SCRIPT VARIABLES

8. Create a copy of this sheet (this is the MCC list of accounts) https://docs.google.com/spreadsheets/d/1R_oQl4B_JwVcix-9w8iu6ZXJq42D-0ZNwXBkvKjREZE/edit#gid=622870480  

  Open it, go to ‘file’ then ‘make a copy’. Then copy the URL of YOUR ‘MCC’ sheet

9. Paste your ‘MCC’ sheet URL in the script next to the variable BADSTRINGS_MCC_SPREADSHEET

10. Create a copy of this sheet (this is the template sheet created for each individual account) https://docs.google.com/spreadsheets/d/161nPkwcC2fe0hHEFh2a0yRzwOO7PK8Ey37zp5YIpx64/edit#gid=1810648742  

   Open it, go to ‘file’ then ‘make a copy’. Then copy the URL of YOUR ‘account’ sheet

   Also change the list of strings as required (you don’t have to use our list)

11. Paste your ‘account’ sheet URL in the script next to the variable BADSTRINGS_SPREADSHEET

12. Change the email in the script (variable RECIPIENT_EMAILS) to the email address that you want to use for notifications

13. If required, change the time duration (variable TIME_DURATION)

    The default time duration is 60 days & only needs to be changed if you really want to!




## INSTRUCTIONS ON RUNNING & SCHEDULING THE SCRIPT

14. Once configured, when running the script for the first time, you’ll need to run it **twice**.

       - The first time it runs, it updates the MCC bad domains dashboard sheet with the list of accounts that have the ws:bd label and sends an email alert with the list of new accounts being added along with a reminder to add the campaign exclusion label if required. This is for security and validation.
       
       - The second time it runs, it will start working as expected and create the bad domains lists for each account and output to the individual account sheets.  
       
15. Next, you can schedule the script to run automatically, as often as once daily. For large display accounts, you can also run hourly or you can run the script on-demand.

    We recommend a daily schedule at later hours of the night (ex. 2am daily) so the sheets are ready for you/your team to review in the morning.
    
    
    
    
## TEST MODE (OPTIONAL):

You shouldn't need to change this, but we have a variable called TEST_MODE, that if set to "yes", causes the spreadsheets to be created for labelled accounts (& show the data found) **BUT does not** create or add the bad domains exclusion list to the account(s).




## LIMITS:

Google ads allow a maximum of 20,000 placement exclusions at a time and total of 65,000 placement exclusions per account.




## FREQUENCY:

You can schedule the script to run per your preference. We recommend a daily schedule.

If the account has a very large Display setup and spend, then you can even schedule to run it hourly.



## NOTE:

The script finds these bad domains from the account's autoplacement reports.
Which means the exclusion will occur after the placement has served an impression and so you may see some data for excluded strings in your placement reports.




## Feedback:

Got feedback for us? Script didn’t work as planned? See an improvement?

Let us know:
https://docs.google.com/forms/d/e/1FAIpQLSeBq4WFkDlku1zqdU9DB_Lpe4DHHgnJzOY4jqX_Qw3QaRg0xg/viewform







