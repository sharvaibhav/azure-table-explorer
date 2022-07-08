import { Equipment } from "../types/Equipment";

const fs = require("fs");
const JSONStream = require("JSONStream");


const CHUNK_SIZE = 10 * 1024 * 1024, // 10MB
  buffer = Buffer.alloc(CHUNK_SIZE);
  


function readFileInChunks(filePath : string) :  Promise<Equipment[]> {
  return new Promise(function(resolve, reject) {
    const completeData :any[] = []
    let startTime: number = Date.now();
    const stream = fs.createReadStream(filePath, { encoding: "utf8" });
    const parser = JSONStream.parse("*");
    parser.on('data', (item: Equipment) => {
      if(completeData.length > 1000){
        resolve(completeData)
      }
      completeData.push(item);
    });

    parser.on('end', function () {
      resolve(completeData);
      const timeDiff = (new Date().getTime() - startTime);
      console.log("Total time taken in reading the file",Math.floor(timeDiff/60000), " minutes and ", timeDiff % 60000/1000, " seconds");
    });
    stream.pipe(parser);
  })

}


export default readFileInChunks;