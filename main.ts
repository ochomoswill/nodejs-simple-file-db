const fsProm = require('fs/promises')

const readFileAsync = async (fileName: string) => {
    try{
        const data = await fsProm.readFile(fileName, {encoding: 'utf8'});
        return JSON.parse(data);
    }catch (e) {
        console.log('@readFileAsync err ', e)
    }
}

const writeFileAsync = async (fileName: string, content: any) => {
    try{
        await fsProm.writeFile(fileName, JSON.stringify(content))
    }catch (e) {
        console.log('@writeFileAsync err ', e)
    }
}

// NOTE: Arrow Functions have no `this`.
const fileStore = (fileName: string) => {
    return {
        async init () {
            return await writeFileAsync(fileName, {})
        },
        async getData () {
            return await readFileAsync(fileName)
        },
        async addData(content: any) {
            await writeFileAsync(fileName, content)
        },
        async create (tableName: string) {
            const fileDbData = await this.getData();
            let newFileDbData: any = {};

            if(fileDbData){
                newFileDbData = {...fileDbData}
            }

            if(newFileDbData[tableName]){
                console.error(`The table, ${tableName}, already exists`)
            }else{
                newFileDbData[tableName] = [];
            }

            await this.addData(newFileDbData);
        },
        async select(tableName: string){
            const fileDbData = await this.getData();

            if(!fileDbData?.[tableName]){
                console.error(`The table, ${tableName}, already exists`)
            }else {
                return fileDbData?.[tableName]
            }
        },
        async selectAll(tableName: string){
            return await this.select(tableName);
        },
        async selectWhere(tableName: string, tableField: string, tableFieldValue: any){
            const allData = await this.select(tableName);

            if(Array.isArray(allData)){
                return allData.find((dataItem) => {
                    if(!dataItem?.[tableField]) {
                        console.error(`Table ${tableName} has no field, ${tableField}`)
                    }

                    return dataItem?.[tableField] === tableFieldValue
                });
            }
        },
        async insertInto(tableName: string, newTableData: any){
            const fileDbData = await this.getData();

            if(fileDbData?.[tableName]){
                fileDbData?.[tableName]?.push(newTableData);
            }

            await this.addData(fileDbData);
        },
        async updateWhere(tableName: string, tableField: string, tableFieldValue: any, newTableData: any){
            const fileDbData = await this.getData();

            if(fileDbData?.[tableName]){
                const foundIndex = fileDbData?.[tableName]?.findIndex((dataItem: any) => dataItem?.[tableField] === tableFieldValue);

                if(foundIndex > -1){
                    fileDbData?.[tableName]?.splice(foundIndex, 1, newTableData);
                    await this.addData(fileDbData);
                }else{
                    console.error(`No record exists with ${tableField} = ${tableFieldValue}`)
                }
            }
        },
        async deleteWhere(tableName: string, tableField: string, tableFieldValue: any){
            const fileDbData = await this.getData();

            if(fileDbData?.[tableName]){
                const foundIndex = fileDbData?.[tableName]?.findIndex((dataItem: any) => dataItem?.[tableField] === tableFieldValue);

                if(foundIndex > -1){
                    fileDbData?.[tableName]?.splice(foundIndex, 1);
                    await this.addData(fileDbData);
                }else{
                    console.error(`No record exists with ${tableField} = ${tableFieldValue}`)
                }
            }
        }
    }
}




const demoWithUsers = async () => {
    // create entity
    // create('users')
    await fileStoreInstance.create('users');
    await fileStoreInstance.create('products');

    // select
    // selectAll('users')
    // selectWhere('users', 'user_id', 1)
    console.log('@selectAll ', await fileStoreInstance.selectAll('users'));
    console.log('@selectWhere ', await fileStoreInstance.selectWhere('users', 'user_id', 1));

    // insert into
    // insertInto('users', newUser)
    //TODO check if a record exists with the primary key
    console.log('@insertInto ', await fileStoreInstance.insertInto('users', {
        user_id: 3,
        name: 'Temperance'
    }));

    // update
    // updateWhere('users', 'user_id', 1, updatedObj)
    console.log('@updateWhere ', await fileStoreInstance.updateWhere('users', 'user_id', 3, {
        user_id: 3,
        name: 'Brennan'
    }));

    // deleteWhere('users', 'user_id', 1)
    // console.log('@deleteWhere ', await fileStoreInstance.deleteWhere('users', 'user_id', 3));
}

const fileStoreInstance = fileStore('newdb.json');
fileStoreInstance.init();

const mainFn = async () => {


    // TODO check if file doesn't exist and create during write or read
    // TODO figure out how to define primary key for each field
    // fileStoreInstance.create('accounts')

    await demoWithUsers();






    // console.log('@username ', await readFileAsync(FILE_NAME))
}


mainFn()

