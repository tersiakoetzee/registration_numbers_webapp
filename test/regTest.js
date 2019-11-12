const assert = require('assert');
const regFactory = require('../registration_number');
const pg = require("pg");
const Pool = pg.Pool;


const connectionString = process.env.DATABASE_URL || "postgresql://codex:codex123@localhost/registrations";


const pool = new Pool({
    connectionString
});
describe("The RegNumbers", function () {
    beforeEach(async () => {
        await pool.query('DELETE FROM regs;');
    })

    describe("The setTownReg", function () {
        it("should set the registration entered in the right format and return each row ", async function () {
            var registration = regFactory(pool);

            await registration.setTownReg("CY 12345");
            await registration.setTownReg("CA 45678");
            await registration.setTownReg("CK 45678");
            await registration.setTownReg("CL 85678");

            let test = registration.getAllRegNumbers()
            assert.equal(test.rows)
        });

        it("should not be able to duplicate, a registration should only enter thr database once", async function () {
            var registration = regFactory(pool);

            await registration.setTownReg("cl 45678");
            await registration.setTownReg("cl 45678");
            await registration.setTownReg("cl 45678");
            var test = await registration.getAllRegNumbers()
            assert.equal(0, test.length);



        });
        it("It should return  an error message when no registration number added", async function () {

            var registration = regFactory();

            registration.setTownReg("");

            assert.equal("Please Enter A Valid Registration", await registration.errorReg());
        });

        it("It should return  an error message when a registration is added with a town that is not supported", async function () {

            var registration = regFactory(pool);
            
            await registration.setTownReg("GP 123");
            let results = await registration.errorReg()
                        
            assert.equal(results,'Please Enter A Valid Registration for the Selected Towns', await registration.errorReg());
        });
    })

    describe("The filterForTownRegNumbers", function () {
        it("It should return all registrations from the selected town", async function () {

            var registration = regFactory(pool);

            await registration.setTownReg("CA 123 456");
            await registration.setTownReg("CA 324 567");
            await registration.setTownReg("CY 123 243");
            await registration.setTownReg("CL 123 456");

            let test = registration.getAllRegNumbers()
            assert.equal(test.rows)
            let loc = 'CA'

            let filter = await registration.filterForTownRegNumbers(loc)
            assert.deepEqual(filter, ["CA 123 456", "CA 324 567"])

        });
    })

}) 
