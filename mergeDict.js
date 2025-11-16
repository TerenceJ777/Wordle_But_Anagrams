import loadDictionary from './loadDictionary.js';

let dictionaryToMerge = [];
let dictionary = [];

async function mergeDict(){
    const response = await fetch("dictionaryToMerge.txt");
    dictionary = await loadDictionary();
    const text = await response.text();
    dictionaryToMerge = text
        .split(/\r?\n/)
        .map(word => word.trim().toUpperCase())
        .filter(word => word.length > 0);
    
    
}