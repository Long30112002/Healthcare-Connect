
import * as useFetch from "../../../../../../src/application/hooks/useFetch"
import { mockAll, readOutput } from '../../../../../../__lozicode__/mock';

mockAll();

describe("useFetch.useFetch", () =>  {
  it("default", async () => {
    const actualOutput = await useFetch.useFetch(null, null, null);
    console.log(actualOutput);
    // readOutput('useFetch/useFetch/default')
  });
})