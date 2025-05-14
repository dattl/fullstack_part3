const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

let argName = null;
let argNumber = null;

if (process.argv.length === 5) {
    argName = process.argv[3];
    argNumber = process.argv[4];
}


const url = `mongodb+srv://datltq:${password}@cluster0.6ntxs.mongodb.net/phoneBookApp?retryWrites=true&w=majority&appName=Cluster0`

const run = async () => {
    mongoose.set('strictQuery', false)

    await mongoose.connect(url)

    const personSchema = new mongoose.Schema({
        name: String,
        number: String,
    })

    const Person = mongoose.model('Person', personSchema);

    if (argName) {
        const person = new Person({
            name: argName,
            number: argNumber
        })

        person.save().then(result => {
            console.log(`Added ${argName} number ${argNumber} to phonebook!`)
            mongoose.connection.close()
        })
    }
    else {
        console.log(`phonebook:`);
        await Person.find({}).then(result => {
            result.forEach(p => {
                // console.log(p)
                console.log(`${p.name} ${p.number}`);
            })
            mongoose.connection.close()
        });
    }

}

run();