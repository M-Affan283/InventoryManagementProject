# Weighbridge App

## Overview

The Weighbridge App is a comprehensive solution designed for managing inventory, weight transactions, and records for a logistics/warehouse operation. The system tracks the movement of goods through weighing transactions, manages contractors, vendors, and employees, and provides detailed reports and analytics.

The application consists of two main components:

- **Backend Server**: A Node.js Express server with MongoDB for data storage
- **Frontend Client**: An Electron-based desktop application with React for the UI

## System Features

### Weight Transaction Management

The core functionality revolves around tracking goods by weight:

1. **Incoming Weight Transactions**

   - Record truck details (number, driver information)
   - Capture empty truck weight and filled truck weight
   - Calculate goods weight based on the difference
   - Associate transactions with vendors and goods types

2. **Outgoing Weight Transactions**

   - Track container and truck details
   - Record empty weight and filled weight measurements
   - Calculate goods weight for outgoing shipments
   - Link to vendors and goods types

3. **Serial Scale Integration**
   - Connect to digital scales via serial port (COM port)
   - Read weight values directly from connected scales
   - Configure communication settings (COM port, baud rate)

### Entity Management

The system provides comprehensive management of:

1. **Users and Employees**

   - User authentication with role-based access control
   - Admin and Employee roles with different permissions
   - Password management and reset functionality

2. **Vendors**

   - Maintain vendor details including contact information
   - Associate vendors with transactions
   - Track transactions by vendor

3. **Contractors**

   - Manage contractor information
   - Record contractor work details
   - Calculate payment based on goods weight and rates

4. **Goods Types**
   - Define different types of goods handled
   - Set rates for each goods type
   - Track inventory by goods type

### Transactions and Records

Beyond weight tracking, the system manages:

1. **Internal Transactions**

   - Track contractor work on goods
   - Record work amount based on goods weight and rate
   - Monitor internal movement of goods

2. **External Transactions**
   - Document transactions with external companies
   - Record vehicle weights and rates
   - Calculate transaction amounts

### Reporting and Analytics

The system provides comprehensive reporting:

1. **Dashboard**

   - Summary of today's transactions
   - Weekly, monthly, and quarterly statistics
   - Visual representations of data (charts and graphs)
   - Analysis of incoming and outgoing goods

2. **Transaction Documentation**
   - Generate PDF reports for all transaction types
   - Detailed view of individual transactions
   - Historical record keeping

## Technical Architecture

### Backend Server

The server is built with:

- **Node.js and Express**: For the API server
- **MongoDB**: For data storage
- **Mongoose**: For database schema management and validation

#### Database Schema

The system uses several interconnected data models:

1. **UserInfo**: Store user/employee information

   - Personal details (name, email)
   - Authentication data (hashed password)
   - Role information (admin or employee)

2. **WeighingTransactions**: For incoming/outgoing truck weight records

   - Truck details
   - Weight measurements (empty, filled, goods)
   - Associated vendor and goods type
   - Timestamps and employee information

3. **OutgoingWeighingTransactions**: For outgoing container shipments

   - Container and truck information
   - Various weight measurements
   - Associated vendor and goods type

4. **Vendor**: Store vendor information

   - Contact details
   - Point of contact information
   - Transaction history references

5. **Contractor**: Manage contractor details

   - Contact information
   - Work history references

6. **ContractorWork**: Track work performed by contractors

   - Goods weight processed
   - Rates and payment calculations
   - Timestamps and related goods type

7. **GoodsType**: Define types of goods handled

   - Identification code and name
   - Current inventory weight
   - Rate information

8. **ExternalTransactions**: Record transactions with external entities
   - Company information
   - Vehicle details
   - Weight and rate calculations

#### API Routes

The server exposes two main route groups:

1. **User Routes** (`/user/...`)

   - Authentication: `login`, `createUser`, `updatePassword`, `resetPassword`
   - User Management: `getAllUsers`, `deleteUser`
   - Contractor Management: `addContractor`, `deleteContractor`, `getAllContractors`
   - Vendor Management: `addVendor`, `deleteVendor`, `getAllVendors`

2. **Goods Routes** (`/goods/...`)
   - Weight Transactions: `addWeighingTransaction`, `getWeighingTransactions`, etc.
   - External Transactions: `addExternalTransaction`, `getExternalTransactions`, etc.
   - Contractor Work: `addContractorWork`, `getContractorWork`, etc.
   - Goods Type Management: `addGoodsType`, `getGoodsTypes`, etc.
   - Data Aggregation: `widgetData` for dashboard statistics

### Frontend Client

The frontend is built with:

- **Electron**: For cross-platform desktop application
- **React**: For UI components and state management
- **React Router**: For navigation
- **Axios**: For API communication
- **MUI and Flowbite**: For UI components

#### Key Components

1. **Authentication**

   - Login interface
   - User profile management
   - Password reset functionality

2. **Dashboard**

   - Overview of transactions
   - Statistical widgets and charts
   - Quick access to main functions

3. **Transaction Management**

   - Forms for adding different transaction types
   - Lists of transactions with filtering options
   - Detailed views for individual transactions
   - PDF report generation

4. **Entity Management**

   - Interfaces for managing users, contractors, vendors
   - Forms for adding and editing entities
   - Lists with search and filter capabilities

5. **Settings**
   - Serial port configuration for weight scales
   - Application preferences
   - User settings

#### Serial Communication

The Electron app includes functionality to:

- List available serial ports
- Configure connection parameters (COM port, baud rate)
- Read weight data directly from connected scales
- Process the data for use in transaction forms

## Installation and Setup

### Server Setup

1. Navigate to the server directory:

   ```
   cd server
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Configure environment variables in `config.env`:

   - MongoDB connection string
   - Port number
   - Other configuration parameters

4. Start the server:
   ```
   npm start
   ```

### Client Setup

1. Navigate to the client directory:

   ```
   cd client
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. For development:

   ```
   npm run dev
   ```

4. To build the application:
   ```
   npm run build
   ```

## Usage Workflow

1. **Login** to the system with appropriate credentials
2. Use the **Dashboard** to view current status and statistics
3. **Record Transactions**:
   - Add incoming weight transactions when trucks arrive
   - Add outgoing weight transactions when containers are shipped
   - Record contractor work and external transactions
4. **Manage Entities**:
   - Add/edit vendors, contractors, and goods types as needed
   - Manage user accounts (admin only)
5. **Generate Reports** for transactions as needed
6. Configure application **Settings** as required

## System Requirements

- **Server**: Node.js environment with internet connectivity
- **Client**: Windows, macOS, or Linux operating system
- **Hardware**: Serial port and compatible digital scale (for weight reading functionality)
