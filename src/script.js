const fs = require('fs');
const path = require('path');
const { match } = require('assert');

const dataPatch = path.join(__dirname, 'data.json');
let data = JSON.parse(fs.readFileSync(dataPatch));

function render(highlight, type) {
    function filtertodo(todo, index, type) {
        return (type === "a1" || !type) || (type === "a3" && data[index].completed) || (type === "a2" && !data[index].completed);
    }
    document.querySelector('.list').innerHTML = data
    .map(function(item, index) {
        let checked1 = item.completed ? 'checked' : '';
        if (highlight && item.title.toLowerCase().includes(highlight.toLowerCase())) {
            return `<div class="todo"><div class="box1"><input class="checkbox" id="check${index}" type="checkbox" ${checked1}></div><div class="box2"><label for="check${index}">${(index + 1)} ${item.title}</label></div><div class="box3"><input class="removeBut" type="button" value="❌"></div></div>`
            .replace(new RegExp(highlight, 'gi'), (match) => `<span style="color: red;">${match}</span>`)
        } else if (!highlight) { 
            return `<div class="todo"><div class="box1"><input class="checkbox" id="check${index}" type="checkbox" ${checked1}></div><div class="box2"><label for="check${index}">${(index + 1)} ${item.title}</label></div><div class="box3"><input class="removeBut" type="button" value="❌"></div></div>`
        }
    })
    .filter((todo, index) => filtertodo(todo, index, type))
    .join('');

    const todolist = document.querySelectorAll('.box2');
    const toggleTodo = document.querySelectorAll('.checkbox');
    const removeTodo = document.querySelectorAll('.removeBut');

    for (let i = 0; i < toggleTodo.length; ++i) {
        const checkbuton = toggleTodo[i];
        checkbuton.addEventListener('change', () => {
            const num =  parseInt(todolist[i].innerText, 10) - 1;
            //const num = data.indexOf(todolist[i].innerText);
            if (data[num].completed) {
                data[num].completed = false;
            }
            else {
                data[num].completed = true;
            }
            fs.writeFileSync(dataPatch, JSON.stringify(data));
            render(highlight, type);
        });  
    }  

    for (let i = 0; i < removeTodo.length; ++i) {
        const removeBut = removeTodo[i];
        removeBut.addEventListener('click', () => {
            data.splice((parseInt(todolist[i].innerText, 10) - 1), 1);
            fs.writeFileSync(dataPatch, JSON.stringify(data));
            render(highlight, type);
        });  
    }  

    let leftTodo = 0;
    for (let i = 0; i < data.length; ++i) {
        if (data[i].completed) {
            ++leftTodo;
        }
    }
    document.querySelector('.left').innerHTML = ('<div class="left"><b> Дел осталось: ' + (data.length - leftTodo) + '</b></div>');

    document.querySelector('.remove').innerHTML = leftTodo === 0 ? ('<div><input class="remove" style="visibility: hidden" type="button" value="Удалить завершенные"></div>'):
    ('<div><input class="remove" style="visibility: visible" type="button" value="Удалить завершенные"></div>');

    if (leftTodo === data.length) {
        document.querySelector('.check').checked = true; 
    } else {
        document.querySelector('.check').checked = false; 
    }
}

function init() { 
    render();
    let type;
    let search;

    for (const radio of document.querySelectorAll('.radioBut')) {
        radio.addEventListener('change', () => {
            type = radio.value;
            render(search, type);
        })
    }

    document.querySelector('.searchStr')
        .addEventListener('input', (e) => {
            if (e.target.value.length !== 0) {
                search = e.target.value;
                render(search, type);
            }
            else {
                search = '';
                render('', type);                
            }
    })

    document.querySelector('.strTodo')
        .addEventListener('keypress', (e) => {
            if (e.target.value.length !== 0 && e.key === 'Enter') {
                data.push({"title" : e.target.value,"completed":false});
                fs.writeFileSync(dataPatch, JSON.stringify(data));
                e.target.value = '';
                render(search, type);
            }
    })
    
    document.querySelector('.remove')
        .addEventListener('click', () => {
            let newData = data.filter(x => !x.completed);
            data = newData;
            fs.writeFileSync(dataPatch, JSON.stringify(data));
            render(search, type);
    })

    document.querySelector('.check')
        .addEventListener('click', () => {
            
            for (let i = 0; i < data.length; ++i) {
                if (document.querySelector('.check:checked'))  {
                    data[i].completed = true;
                }else {
                    data[i].completed = false;
                }
            } 

            fs.writeFileSync(dataPatch, JSON.stringify(data));
            render(search, type);
    })
}

init();