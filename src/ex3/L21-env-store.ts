import { add, map, zipWith } from "ramda";
import { Value } from './L21-value-store';
import { Result, makeFailure, makeOk, bind, either, isOk } from "../shared/result";

// ========================================================
// Box datatype
// Encapsulate mutation in a single type.
type Box<T> = T[];  // ---> Box<Box<Values>[]> = Box<Values>[][]
const makeBox = <T>(x: T): Box<T> => ([x]);
const unbox = <T>(b: Box<T>): T => b[0];
const setBox = <T>(b: Box<T>, v: T): void => { b[0] = v; return; }

// ========================================================
// Store datatype
export interface Store {
    tag: "Store";
    vals: Box<Box<Value>[]>; 
}

export const isStore = (x: any): x is Store => x.tag === "Store";;  // box(array of (boxes of values))
export const makeEmptyStore = () : Store  => ({tag: "Store", vals: makeBox([]) })   // box(array) 

export const theStore: Store = makeEmptyStore(); //The main Store like "database" of values.

export const extendStore = (s: Store, val: Value): Store =>  { //Adding a new value to the store by using (define ) or applyClosure. 
    setBox(s.vals,unbox(s.vals).concat([makeBox(val)]));
    return s;
}


export const getLastAddress = (s: Store) : number => (unbox(s.vals).length-1); // after we add a new value we want to get his position "Address"
    
export const applyStore = (store: Store, address: number): Result<Value> => // returns the real value of the argument by using his address
    makeOk(unbox(unbox(store.vals)[address]));
    
  
export const setStore = (store: Store, address: number, val: Value): void => {
    setBox(unbox(store.vals)[address],val)
}
    // 


    
//for using the (set! ) method.
    
    

// ========================================================
// Environment data type
// export type Env = EmptyEnv | ExtEnv;
export type Env = GlobalEnv | ExtEnv;

interface GlobalEnv {
    tag: "GlobalEnv";
    vars: Box<string[]>;
    addresses: Box<number[]>;
}


export interface ExtEnv {
    tag: "ExtEnv";
    vars: string[];
    addresses: number[];
    nextEnv: Env;
}

const makeGlobalEnv = (): GlobalEnv =>
    ({tag: "GlobalEnv", vars: makeBox([]), addresses:makeBox([])});

export const isGlobalEnv = (x: any): x is GlobalEnv => x.tag === "GlobalEnv";

// There is a single mutable value in the type Global-env
export const theGlobalEnv = makeGlobalEnv();

export const makeExtEnv = (vs: string[], addresses: number[], env: Env): ExtEnv =>
    ({tag: "ExtEnv", vars: vs, addresses: addresses, nextEnv: env});

const isExtEnv = (x: any): x is ExtEnv => x.tag === "ExtEnv";

export const isEnv = (x: any): x is Env => isGlobalEnv(x) || isExtEnv(x);

// Apply-env
export const applyEnv = (env: Env, v: string): Result<number> =>
    isGlobalEnv(env) ? applyGlobalEnv(env, v) :
    applyExtEnv(env, v);




const applyGlobalEnv = (env: GlobalEnv, v: string): Result<number> => 
        unbox(env.vars).includes(v) ? makeOk(unbox(env.addresses)[unbox(env.vars).indexOf(v)]) : 
        makeFailure("where is my varDec man? come On " + v);




    
/*
interface GlobalEnv {
    tag: "GlobalEnv";
    vars: Box<Box<string[]>>;
    addresses: Box<Box<number[]>>;
}
const makeBox = <T>(x: T): Box<T> => ([x]);
const unbox = <T>(b: Box<T>): T => b[0];
const setBox = <T>(b: Box<T>, v: T): void => { b[0] = v; return; }
b[0] = b[0].concat([var])
*/


export const globalEnvAddBinding = (v: string, addr: number): void =>
    {
        setBox(theGlobalEnv.vars,unbox(theGlobalEnv.vars).concat([v]));
        setBox(theGlobalEnv.addresses,unbox(theGlobalEnv.addresses).concat([addr]));
    }

const applyExtEnv = (env: ExtEnv, v: string): Result<number> =>
    env.vars.includes(v) ? makeOk(env.addresses[env.vars.indexOf(v)]) :
    applyEnv(env.nextEnv, v);

export const applyEnvStore = (env: Env, v: string) : Result<Value> =>
{
    const address = applyEnv(env,v);
    return isOk(address) ? applyStore(theStore,address.value) : makeFailure("why I am not ok man?")
}
