import inquirer from 'inquirer';

export const Inquirer = async ({name, question, type='input', choices=null}) => {
    return new Promise ( (resolve, reject) => {
        inquirer
        .prompt([
            {
                name,
                message: question,
                type,
                choices
            }
        ])
        .then(answers => {
            resolve(answers[name]);
        });
    })
       
}
