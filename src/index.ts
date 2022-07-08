import * as dotenv from 'dotenv';

import { TableClient, TableServiceClient } from "@azure/data-tables";
import readFileInChunks from './files/filesUtility';
import { Equipment } from './types/Equipment';

declare var CONN_STRING: string;



dotenv.config();


const TABLE_NAME = 'equipments';


function createTableServiceClient() : TableServiceClient {
    return TableServiceClient.fromConnectionString(CONN_STRING);
}

function createTableClient() : TableClient{
    return TableClient.fromConnectionString(CONN_STRING, TABLE_NAME);
}

function readFile(fileName :string) : Promise<Equipment[]> {
    const nameToFilePathMapper : { [key: string]: string; } = {
        equipment : './src/data/johancastberg-equipments-data.json',
        system : './src/data/jc-system.json'
    }
    return readFileInChunks(nameToFilePathMapper[fileName]);
}

async function addEquipmentDataToTable(data: Equipment[]) {
    let promisesList = [];
    const tableServiceClient = createTableServiceClient();
    // create table
    await tableServiceClient.createTable(TABLE_NAME)
    
    const tableClient = createTableClient();
    // loop through data
    for (let i = 0; i < data.length; i++) {
        const entity = {
            partitionKey: "johancastberg",
            rowKey: data[i].id,
            type: data[i].type,
            tagNumber: data[i].tagNumber,
            description: data[i].description,
            facility: data[i].facility,
            area: data[i].area,
            system: data[i].system,
            discipline: data[i].discipline,
            procurementPackage: data[i].procurementPackage,
            processLine: data[i].processLine,
            id: data[i].id,
            topTag: data[i].topTag,
            attributes : JSON.stringify(data[i]?.attributes)
        };
        promisesList.push(tableClient.upsertEntity(entity))
        // threshold of 500 entities per batch
        if(i % 500 === 0){
            console.log("data inserted", i);
            await Promise.all(promisesList)
            promisesList = [];
        }
    }
}

async function execute(){
    const data = await readFile("equipment")
    addEquipmentDataToTable(data);
}


execute();