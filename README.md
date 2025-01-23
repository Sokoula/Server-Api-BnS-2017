![ViewCount](https://hits.sh/github.com/war100ck/Server-Api-BnS-2017.svg?style=flat-square)

![Dev.to blog](https://img.shields.io/badge/dev.to-0A0A0A?style=for-the-badge&logo=dev.to&logoColor=white)![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white)![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)![Windows](https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white)
# Blade & Soul Game API Server 2017

This repository contains the backend API server for the **Blade & Soul** private game server. The API facilitates user registration, login, profile management, virtual currency transactions, and character management. It integrates multiple databases and provides secure and scalable routes to handle user data efficiently. **Currently, it is designed only for the 2017 version of the game.**

This API server has been tested on a private Blade & Soul test server.

![Server Api B&S Server](https://raw.githubusercontent.com/war100ck/Server-Api-BnS-Server/main/screen/0-1.png)

<details>
<summary>Click to see more screenshots</summary>

![2.](https://raw.githubusercontent.com/war100ck/Server-Api-BnS-Server/main/screen/0-2.png)

</details>

<details>
<summary>Click to explore website screenshots</summary>

![2.](https://raw.githubusercontent.com/war100ck/Server-Api-BnS-Server/main/screen/full_page_screen.png)

<hr style="border: 1px solid #ccc; margin: 10px 0;">

![2.](https://raw.githubusercontent.com/war100ck/Server-Api-BnS-Server/main/screen/site-01.png)

<hr style="border: 1px solid #ccc; margin: 10px 0;">

![2.](https://raw.githubusercontent.com/war100ck/Server-Api-BnS-Server/main/screen/site-02.png)

<hr style="border: 1px solid #ccc; margin: 10px 0;">

![2.](https://raw.githubusercontent.com/war100ck/Server-Api-BnS-Server/main/screen/site-03.png)

</details>

<details>
<summary>Click to view more screenshots of the Admin Panel</summary>

![2.](https://raw.githubusercontent.com/war100ck/Server-Api-BnS-Server/main/screen/admin-00.png)

<hr style="border: 1px solid #ccc; margin: 10px 0;">

![2.](https://raw.githubusercontent.com/war100ck/Server-Api-BnS-Server/main/screen/admin-01.png)

<hr style="border: 1px solid #ccc; margin: 10px 0;">

![2.](https://raw.githubusercontent.com/war100ck/Server-Api-BnS-Server/main/screen/admin-02.png)

<hr style="border: 1px solid #ccc; margin: 10px 0;">

![2.](https://raw.githubusercontent.com/war100ck/Server-Api-BnS-Server/main/screen/admin-003.png)

<hr style="border: 1px solid #ccc; margin: 10px 0;">

![2.](https://raw.githubusercontent.com/war100ck/Server-Api-BnS-Server/main/screen/admin-03.png)

<hr style="border: 1px solid #ccc; margin: 10px 0;">

![2.](https://raw.githubusercontent.com/war100ck/Server-Api-BnS-Server/main/screen/admin-04.png)

<hr style="border: 1px solid #ccc; margin: 10px 0;">

![2.](https://raw.githubusercontent.com/war100ck/Server-Api-BnS-Server/main/screen/admin-05.png)

<hr style="border: 1px solid #ccc; margin: 10px 0;">

![2.](https://raw.githubusercontent.com/war100ck/Server-Api-BnS-Server/main/screen/admin-06.png)

<hr style="border: 1px solid #ccc; margin: 10px 0;">

![2.](https://raw.githubusercontent.com/war100ck/Server-Api-BnS-Server/main/screen/admin-07.png)

</details>

## Table of Contents

- [Key Features](#key-features)
- [Requirements](#requirements)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Dependencies](#dependencies)
- [B&S Game Launcher](#bns-game-launcher)
- [License](#license)
- [Discussion](#Discussion)
- [Additions / Fixes](#additions--fixes)

## Key Features

- **WebSite**: A comprehensive website offering seamless user experience with account profile viewing, including detailed character data, alongside an administrative panel for efficient user and content management.
- **User Authentication**: Secure user registration and login with email and password validation.
- **Admin Control Panel**: Comprehensive Admin Dashboard for efficient server and user management.
- **Profile Management**: Full support for viewing and updating user profiles, including character data and account information.
- **Character Management**: Tools for editing character details like faction, race, job, and other attributes.
- **Virtual Currency Transactions**: APIs to manage and add in-game currency to user accounts.
- **Item Management and Distribution**: Search the database for items by ItemID and dispatch them to user account characters via the admin panel.
- **"Account Banning and Player Kicking**: Ability to impose a temporary or permanent account ban on a user, as well as the ability to promptly kick a player from the server.
- **VIP Privileges Managementn**: Effortlessly manage and assign VIP privileges to users through the admin panel. This feature allows administrators to grant special in-game benefits and access to premium content, ensuring an enhanced experience for VIP players.
- **Game Server Monitoring**: Real-time server monitoring that provides detailed insights into the number of players online, and their activity. This feature enables administrators to track server health,and monitor player.
- **Game Server Statistics**: Game statistics with insightful charts displaying the number of registered accounts, including breakdowns by character races, genders, classes, factions, and levels.
- **Database Integration**: Utilizes Microsoft SQL Server for managing user accounts, in-game data, and virtual currencies.
- **Logging**: Optional logging feature, controlled through environment variables, allows detailed logging to console for debugging and monitoring.
- **Scalability**: Designed to support a large number of users and database operations, ensuring performance and security for a Blade & Soul private server.
- **System Statistics**: Monitor CPU Usage, Memory Usage, and Server API Process Information to assess server load and performance in real time, helping ensure smooth operation and quick issue resolution.

## Requirements

- **Node.js** (v14.0.0 or higher)
- **Microsoft SQL Server** (***no lower than version 2017***) for handling game-related data
- **npm** (Node Package Manager)

## Installation

To set up the API server, follow these steps:

1. **Clone the repository**:

    ```bash
    git clone https://github.com/war100ck/Server-Api-BnS-2017.git
    cd Server-Api-BnS-2017
    ```

2. **Run the Database Setup Script**:

    Before installing the server, make sure to run the `add_column_webadmin.bat` script, which adds the `WebsitePassword` and `admin` column to the `Users` table in the `PlatformAcctDb` database.

    To run the script, use the following command (on Windows):

    ```bash
    add_column_webadmin.bat
    ```

    This script will:
    
    - Check if the `WebsitePassword` and `admin` column exists in the `Users` table of the `PlatformAcctDb` database.
    - If the column does not exist, it will add it.
    - Confirm success or report any issues encountered during the operation.
	
3. **Run the Installation Script**:

    After running the database setup script, you can proceed to install the server. Use the provided `Install.bat` script to automatically create necessary configuration files and install all required dependencies.

    To run the script, use the following command (on Windows):

    ```bash
    Install.bat
    ```

    This script will:
    
    - Generate a `package.json` file with all the necessary npm dependencies.
    - Create `Start_Api.bat` for easy server startup.
    - Create the `.env` file with essential configuration for connecting to the game databases.
    - Install the required npm packages:
      - `express`, `mssql`, `dotenv`, `axios`, `cors`, `ejs`, `argon2`, `bcrypt`, `chalk`, `express-session`, `mysql2`, `os-utils`, `pidusage`, `xml2js`.

4. **Configuration of Categories and Display of Items in Item Management and Distribution** 
 
4.1. **Database Restore Script**:  
     The `restore_databases.sql` script is provided to help you restore the `GameItemsDB` database from the backup file.  
     > **Note:** Before running the script, ensure that you modify the following paths within it:  
     > - Specify the path to the backup file: `"Path to the backup file"`.  
     > - Set the location for the primary database file (`.mdf`).  
     > - Set the location for the transaction log file (`.ldf`).
	 
*Note: The full [**README.md**](https://github.com/war100ck/Server-Api-BnS-2017/tree/main/GAME_ITEMS_DB)
 file with detailed instructions for setting up the **"Sending Items"** functionality can be found in the `GAME_ITEMS_DB` folder. It includes guidance on restoring the database, configuring image filenames, and managing item data required for proper system functionality. Please refer to this document for complete setup steps and further details.*

5. **Configuration**:

    After running the installation script, the `.env` file will be generated with default configurations. Make sure to adjust database credentials and other environment variables if needed:
    
    - `PLATFORM_ACCT_DB_USER`
    - `PLATFORM_ACCT_DB_PASSWORD`
    - `PLATFORM_ACCT_DB_SERVER`
    - `BLGAME01_DB_USER`
    - `SERVICE_URL`

    These variables are used to connect to the Blade & Soul platform accounts, game data, and other services.

6. **Start the API Server**:

    Once everything is installed, you can start the server using the provided `Start_Api.bat` file or manually via:

    ```bash
    npm start
    ```

    The server will be accessible at `http://localhost:3000`.
	
7. **Admin Panel**:

    The admin panel for managing game-related data can be accessed via the following URL:

    ```bash
    http://<server_address>:3000/admin
    ```

    Replace `<server_address>` with the actual address of your server.

### Administrator Assignment and Permissions:

- **Initial Administrator Setup**:  
  The first web administrator is assigned directly in the database:

  **Database**: `PlatformAcctDb`  
  **Table**: `Users`  
  **Column**: `admin` (type: `bit`)  

  Set the value of the `admin` column to `1` for the corresponding user to grant them administrative privileges.

- **Adding New Administrators**:  
  Once the initial web administrator is assigned, they gain access to special features in the admin panel. This includes the ability to add or remove other administrators directly through the website, ensuring efficient and secure delegation of administrative tasks.

## API Endpoints

### User Management

- **GET /check-availability**: Checks if a username or email is available for registration.
    - Query parameters:
        - `account_name`: The desired username.
        - `email`: The user's email.
    
- **POST /signin**: Authenticates a user based on their email and password.
    - Body parameters:
        - `signin_email`: The user's email.
        - `signin_password`: The user's password.

### Admin Panel Management

- **GET /admin**: Provides access to the administrative panel, where the following information is displayed:
    - List of all users from the `PlatformAcctDb` database.
    - The total number of characters created in the game from the `BlGame01` database.
    - The total number of deleted characters from the game (`deletion = 1` in the `CreatureProperty` table).

### Profile Management

- **GET /profile**: Retrieves detailed profile information, including in-game character stats and settings.

### Character Management

- **POST /edit-character**: Allows users to edit character attributes such as:
    - Faction
    - Race
    - Job
    - In-game currency

### Deposit Management

- **POST /add-deposit**: Adds virtual currency to a user's account.

## Environment Variables

The `.env` file contains all the necessary configuration for running the server:

- **Server Configuration**:
    - `PORT`: The port on which the server will run (default: `3000`).
    - `LOG_TO_CONSOLE`: Whether to enable logging to console (`true` or `false`).

- **Database Configuration**:
    - `PLATFORM_ACCT_DB_USER`, `PLATFORM_ACCT_DB_PASSWORD`, `PLATFORM_ACCT_DB_SERVER`, `PLATFORM_ACCT_DB_DATABASE`: Credentials and details for the platform accounts database.
    - `BLGAME01_DB_USER`, `BLGAME01_DB_PASSWORD`, `BLGAME01_DB_SERVER`, `BLGAME01_DB_DATABASE`: Credentials for the in-game database (Blade & Soul).
    - `VIRTUAL_CURRENCY_DB_USER`, `VIRTUAL_CURRENCY_DB_PASSWORD`, `VIRTUAL_CURRENCY_DB_SERVER`, `VIRTUAL_CURRENCY_DB_DATABASE`: Database for managing virtual currency transactions.

## Dependencies

This project relies on the following npm packages:

- **express**: Web framework for building RESTful APIs.
- **mssql**: A library for connecting and querying Microsoft SQL Server.
- **dotenv**: Loads environment variables from a `.env` file into `process.env`.
- **axios**: A promise-based HTTP client for making requests to external services.
- **cors**: Enables Cross-Origin Resource Sharing for allowing requests from different domains.
- **ejs**: Template engine for rendering dynamic HTML.
- **argon2** and **bcrypt**: Libraries for secure password hashing.
- **chalk**: Adds colorful output for logging and debugging.
- **express-session**: Manages user sessions.
- **mysql2**: MySQL database connection support.

## BnS Game Launcher

*Note: The game launcher for this server can be downloaded from [B&S Game Launcher](https://github.com/war100ck/blade-soul-game-launcher).*

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Discussion on Blade & Soul Game API Server

For further information and discussions related to the **Blade & Soul Game API Server** and **Game Launcher**, visit the active discussion on the forum:

[Discussion on RageZone](https://forum.ragezone.com/threads/blade-soul-game-api-server-game-launcher.1234817/)

Here you will find project details, exchange of experiences, and solutions to various technical issues related to the setup and launch of the Blade & Soul API server.

...

## Blade & Soul Game API Server for 2020

If you are looking for the **Blade & Soul** Game API Server for the 2020 version, you can download it here:

[Download Blade & Soul Game API Server 2020](https://github.com/war100ck/BnS-Api-Server)


## Additions / Fixes
<details>
  <summary><b>Change Log: 13/11/2024</b></summary>

  1. **Added authentication for accessing the admin panel**:  
     Implemented a credential verification system to ensure that only authorized administrators can access the admin panel.

  2. **Added a navigation panel to the Admin Panel**:  
     Introduced a navigation bar to improve usability, providing quick access to key sections of the admin panel.

  3. **Minor code tweaks and adjustments**:  
     Made small improvements and optimizations to enhance code stability and readability.

</details>

<details>
  <summary><b>Change Log: 22/1/2025</b></summary>

  1. **Added item management and distribution**:  
     Added the ability to search for items by ItemID in the database and send them to characters on user accounts via the admin panel.

  2. **Added account blocking and player exclusion**:  
     Introduced the ability to apply temporary or permanent account bans and quickly remove players from the server.

  3. **Added VIP privileges management**:  
     Simplified the process of managing and assigning VIP privileges to users via the admin panel, granting access to premium content and special in-game advantages for VIP players.
	 
  4. **Added game server monitoring**:  
     Implemented real-time server monitoring, providing detailed information on the number of players online and their activity.

  5. **Added game server statistics**:  
     Game statistics with charts displaying the number of registered accounts, including breakdowns by character race, gender, class, faction, and level, along with additional insights and data for administrators.
	
  6. **Added VIP status display in user profiles**:  
     Updated the player's account profile page on the website to include detailed information about VIP privileges, such as the current VIP rank, status, and expiration date.

  7. **Added avatar selection for user profiles**:  
     Introduced the ability for users to choose their avatar from a selection of 16 available options, enhancing personalization on the account profile page.

  8. **Minor code tweaks and adjustments**:  
     Made small improvements and optimizations to enhance code stability and readability.

     [Watch the update video on YouTube](https://youtu.be/LbAH0uluWvA?si=b6ft_EsowibnM5s8)
     
</details>


