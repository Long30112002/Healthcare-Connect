import * as useFetch from "../src/application/hooks/useFetch";
import { mock, init } from './core';
import * as fse from 'fs-extra';


export function mockAll() {
  mock(useFetch, {
    functionName: 'useFetch', targetName: 'useFetch'
  });

  init();
}

export function readOutput(path) {
  const outputPath = `output/${path}`;
  if(fse.existsSync(`${outputPath}.html`)) {
    return fse.readFileSync(`${outputPath}.html`);
  }
  if(fse.existsSync(`${outputPath}.json`)) {
    return fse.readJsonSync(`${outputPath}.json`);
  }
}

