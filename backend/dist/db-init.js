"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDatabaseExists = ensureDatabaseExists;
const pg_1 = require("pg");
async function ensureDatabaseExists() {
    const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:Rohitpk27@localhost:5432/insurance';
    const match = dbUrl.match(/postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/([^?]+)/);
    if (!match) {
        console.error('Invalid DATABASE_URL format. Cannot auto-create database.');
        return;
    }
    const [_, user, password, host, portStr, dbName] = match;
    const port = portStr ? parseInt(portStr) : 5432;
    const client = new pg_1.Client({
        user,
        password,
        host,
        port,
        database: 'postgres',
    });
    try {
        await client.connect();
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
        if (res.rowCount === 0) {
            console.log(`Database "${dbName}" does not exist. Creating...`);
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database "${dbName}" created successfully.`);
        }
        else {
            console.log(`Database "${dbName}" already exists.`);
        }
    }
    catch (error) {
        console.error(`Error verifying/creating database "${dbName}":`, error);
    }
    finally {
        await client.end();
    }
}
//# sourceMappingURL=db-init.js.map