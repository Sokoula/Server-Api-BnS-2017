# README: Setting Up the "Sending Items" Functionality

## Overview
This guide explains the steps required to set up the **"Sending Items"** functionality, which relies on the `GameItemsDB` database. This database is used to manage item categories, item names, and the filenames of item images.

## Requirements
1. **GameItemsDB.bak Backup File**:
   A backup file containing all necessary information about item categories, names, and image filenames.

2. **Database Restore Script**:
   Use the `restore_databases.sql` script to restore the `GameItemsDB` database from the provided backup file.  
   > **Note:** Before executing the script, make sure to update the following paths in the script:
   > - The path to the backup file: `"Path to the backup file"`.
   > - The path for the primary data file (`.mdf`).
   > - The path for the transaction log file (`.ldf`).

3. **Image Files**:
   - The database includes references to image filenames, but the actual images **are not provided**.
   - You will need to either:
     - Extract the images from the game client (this can be a time-consuming process).
     - Or set a single image for all items.

4. **Setting a Unified Image**:
   To set a single image for all items in the database, execute the `update_gameitems_filenames.sql` script. This script will replace all image filenames with a default, such as `testItem.png`.

5. **Incomplete Item Categories**:  
   Categories for some items are not assigned in the database. You will need to manually review and assign categories as required.

## File Locations
- The files `GameItemsDB.bak`, `restore_databases.sql`, and `update_gameitems_filenames.sql` are located in the `GAME_ITEMS_DB` folder.
- The folder for item images is located at `\public\images\items\`.

## Purpose of the Database
The `GameItemsDB` database contains all the necessary information to create the **Blade & Soul Database Navigator (BNSDBN)**, a tool for efficient item management in the game.

## Quick Start
1. Restore the `GameItemsDB` database:
   ```sql
   -- Execute the restore_databases.sql script
   ```
   
## Note
By following these steps, you will be able to set up and use the functionality to manage and send in-game items.

> **Note:**  
> A list of items with their corresponding `ItemIDs` and names was sourced from the internet.  
> Please note that the names may not accurately reflect their actual in-game counterparts.  
> The `ItemIDs` of the items were verified selectively; it's recommended to check all `ItemIDs` for accuracy.


  

