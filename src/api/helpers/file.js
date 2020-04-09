import fs from 'fs';
import { IS_DEVELOPMENT } from '../../config';

const FOLDER_NAME = 'test/outputs';

export const writeFile = ({functionName, content}) => {
    /* To output the information to confirm no information leaks happen passphrases and passwords */
    if(IS_DEVELOPMENT){
        fs.writeFileSync(`${FOLDER_NAME}/${functionName}.json`, JSON.stringify(content));
    }else{
        // To not write in production
    }

}