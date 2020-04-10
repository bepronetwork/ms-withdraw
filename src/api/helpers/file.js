import fs from 'fs';
import { IS_DEVELOPMENT, IS_TEST } from '../../config';

const FOLDER_NAME = 'test/outputs';

export const writeFile = ({functionName, content}) => {
    /* To output the information to confirm no information leaks happen passphrases and passwords */
    if(IS_DEVELOPMENT && IS_TEST){
        fs.writeFileSync(`${FOLDER_NAME}/${functionName}.json`, JSON.stringify(content));
    }else{
        // To not write in production
    }

}