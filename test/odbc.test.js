// test/cubrid.test.js
const chai = require('chai');
const expect = chai.expect;
const sum = require('../src/sum');
const addContext = require("mochawesome/addContext")
const {connection, pool} = require("../src/connection");
const dayjs = require("dayjs");

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
describe('Fetch Query', function() {
    it('fetch result for a tables', async function () {
        const con = await connection();
        const result = await con.query("select * from game")
        expect(result.length).greaterThan(1)
        addContext(this, "total rows of game table: " + result.length)
    });

    it('Fetch query with limit 10', async function () {
        const con = await connection();
        const result = await con.query("select * from game limit 10")
        expect(result.length).equal(10)
        addContext(this, "total row of query game table: " + result.length)
    });

});

describe('Inserting to table', function() {
    it('insert a single record to game table', async function () {
        const values = [getRandomInt(2000, 2500), 20022, 14346, 30136, 'NGR', 'A', dayjs().format('YYYY-MM-DD')]
        console.log(values)
        const con = await connection();
        const result = await con.query("INSERT INTO game VALUES (?, ?, ?, ?, ?, ?, ?)", values)
        expect(result.count).equal(1)
        console.log(`Record inserted! Rows affected: ${result.count}`)
        addContext(this, `Record inserted! Rows affected: ${result.count}`)
    });

    it('insert a single record to game table by manual commit', async function () {
        const values = [getRandomInt(6000, 7000), 20022, 14346, 30136, 'NGR', 'A', dayjs().format('YYYY-MM-DD')]

        const con = await connection();
        await con.beginTransaction()
        const result = await con.query("INSERT INTO game VALUES (?, ?, ?, ?, ?, ?, ?)", values)
        await con.commit()
        expect(result.count).equal(1)
        addContext(this, `Record inserted! Rows affected: ${result.count}`)
    });

    it('insert multiple records to game table', async function () {

        const con = await connection();
        await con.beginTransaction()
        let count = 0;
        for (const value of [1,2,3]) {
            const values = [getRandomInt(7000, 8000), 20022, 14346, 30136, 'NGR', 'A', dayjs().format('YYYY-MM-DD')]
            console.log(values)
            let result = await con.query("INSERT INTO game VALUES (?, ?, ?, ?, ?, ?, ?)", values)
            expect(result.count).equal(1)
            addContext(this, result.parameters.toString())
            count++;
        }
        await con.commit()
        addContext(this, `Record inserted! Rows affected: ${count}`)
    });

    it('insert multiple records to game table should error and rollback', async function () {
        const con = await connection();
        try{
            await con.beginTransaction()
            for (const value of [1,2,3]) {
                const values = [getRandomInt(9000, 10000), 20022, 14346, 30136, 'NGR', 'A', dayjs().format('YYYY-MM-DD')]
                let result = await con.query('INSERT INTO game VALUES (?, ?, ?, ?, ?, ?, ?)', values)
                expect(result.count).equal(1)
                addContext(this, result.parameters.toString())
            }
            const values = ["test error string", 20022, 14346, 30136, 'NGR', 'A', dayjs().format('YYYY-MM-DD')]
            addContext(this, `insert value should be error: [${values.toString()}]`)
            let result = await con.query("INSERT INTO game VALUES (?, ?, ?, ?, ?, ?, ?)", values)
            expect(result.count).equal(0)

            await con.commit()
        }catch (error) {
            try {
                addContext(this, `got error: ${error.message} and rollback`);
                await con.rollback();
                console.log('Transaction rolled back.');
            } catch (error) {
                addContext(this, `error during rollback: ${error.message}`);
            }
        }




    });



});


describe('Pool', function() {

    it('fetch result for a tables by using pool instead of connection', async function () {
        const con = await pool();
        const result = await con.query("select * from game")
        expect(result.length).greaterThan(1)
        addContext(this, "total rows of game table: " + result.length)
    });



});