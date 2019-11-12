
module.exports = function (pool) {

    var errorMessage = "";

    async function setTownReg(isValidRegNumber) {

        var rex = /[A-Za-z]{2}\s[0-9]{3}\s[0-9]{3}$/;
        let test1 = rex.test(isValidRegNumber);

        var rex = /[A-Za-z]{2}\s[0-9]{3}$/;
        let test2 = rex.test(isValidRegNumber);

        var rex = /[A-Za-z]{2}\s[0-9]{4}$/;
        let test3 = rex.test(isValidRegNumber);

        var rex = /[A-Za-z]{2}\s[0-9]{5}$/;
        let test4 = rex.test(isValidRegNumber);
        errorMessage = "";

        if (!test1 && !test2 && !test3 && !test4) {
            errorMessage = "Please Enter A Valid Registration"
            return false;
        }


        if (isValidRegNumber) {

            const storeReg = isValidRegNumber.toUpperCase();

            if (isValidRegNumber) {
                let letters = storeReg.substring(0, 2);

                let response = await pool.query('SELECT id FROM town WHERE tag = $1', [letters])
                if (response.rowCount === 0) {
                    errorMessage = 'Please Enter A Valid Registration for the Selected Towns';
                    return false
                } else {
                    // console.log(response);
                    var check = await pool.query('SELECT regnumber FROM regs WHERE regnumber  = $1', [storeReg])
                    if (check.rowCount === 1) {
                        errorMessage = 'This registration has already been entered'
                        return false
                    }

                    var results = response.rows
                    var townId = results[0].id;
                    await pool.query('insert into regs (regnumber, town_id)values ($1,$2)', [storeReg, townId])
                    return true;

                }
            }
        }
    }

    async function getAllRegNumbers() {

        let regList = await pool.query('SELECT regnumber FROM regs')
        const regNumbers = [];
        for (var i = 0; i < regList.rows.length; i++) {
            regNumbers.push(regList.rows[i].regnumber);
        }

        return regNumbers;

    }

    async function filterForTownRegNumbers(loc) {
        var filteredList = []


        if (loc !== '') {

            let filter = getAllRegNumbers()
            filter = await pool.query('SELECT regs.regnumber,town.tag FROM regs INNER JOIN town ON regs.town_id = town.id')
            filter = filter.rows

            for (var x = 0; x < filter.length; x++) {

                if (filter[x].tag === loc) {
                    filteredList.push(filter[x].regnumber)
                }

            }
            return filteredList
        } else {
            return registrationList
        }
    }
    function errorReg() {
        return errorMessage
    }

    async function reset() {
        await pool.query('DELETE FROM regs');
        registrationList = [];
    }

    return {
        setTownReg,
        getAllRegNumbers,
        filterForTownRegNumbers,
        reset,
        errorReg

    }

}

